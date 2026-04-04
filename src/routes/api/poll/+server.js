import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { fetchTrainData } from '$lib/mta.js';
import { getSupabase } from '$lib/supabase.js';
import { personas } from '$lib/personas.js';

/** If status is unchanged, still post to social_feed when the line's last post is older than this (ms). */
const SOCIAL_HEARTBEAT_MS = 24 * 60 * 60 * 1000;

export async function POST({ request }) {
	const secret = request.headers.get('x-cron-secret');
	if (!env.CRON_SECRET || secret !== env.CRON_SECRET) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const supabase = getSupabase();
	const genAI = env.GEMINI_API_KEY ? new GoogleGenerativeAI(env.GEMINI_API_KEY) : null;
	const model = genAI?.getGenerativeModel({ model: 'gemini-2.5-flash' });

	let trainData;
	try {
		trainData = await fetchTrainData({ bypassCache: true });
	} catch (err) {
		return json({ error: 'MTA fetch failed', detail: err.message }, { status: 500 });
	}

	const { trains } = trainData;
	const generated = [];
	const errors = [];
	let skipped = 0;

	for (const train of trains) {
		if (!train) continue;
		const { route } = train;
		const currentStatus = train.statusDetails.statusSummary;
		const alerts = train.alerts || [];
		const alertDescs = alerts
			.map(a => a.description)
			.filter(Boolean)
			.join('; ');
		const currentReason = alertDescs || null;

		const { data: lastLog, error: logError } = await supabase
			.from('train_status_logs')
			.select('status_text, reason')
			.eq('line', route)
			.order('created_at', { ascending: false })
			.limit(1)
			.maybeSingle();

		if (logError) {
			errors.push({ route, stage: 'dedup_query', message: logError.message });
			continue;
		}

		let skipDuplicateStatusLog = false;
		let heartbeatLatestPost = null;
		const statusUnchanged = lastLog
			&& lastLog.status_text === currentStatus
			&& (lastLog.reason || null) === currentReason;
		if (statusUnchanged) {
			const { data: latestFeed, error: latestFeedErr } = await supabase
				.from('social_feed')
				.select('created_at, content, alert_details')
				.eq('line', route)
				.order('created_at', { ascending: false })
				.limit(1)
				.maybeSingle();

			if (latestFeedErr) {
				errors.push({ route, stage: 'heartbeat_query', message: latestFeedErr.message });
				continue;
			}

			const lastPostAt = latestFeed?.created_at ? new Date(latestFeed.created_at).getTime() : 0;
			if (lastPostAt && Date.now() - lastPostAt < SOCIAL_HEARTBEAT_MS) {
				skipped++;
				continue;
			}

			skipDuplicateStatusLog = true;
			heartbeatLatestPost = latestFeed;
		}

		const repostContent = heartbeatLatestPost?.content?.trim();
		if (skipDuplicateStatusLog && repostContent) {
			const { error: feedInsertErr } = await supabase.from('social_feed').insert({
				line: route,
				content: repostContent,
				status_context: currentStatus,
				alert_details: heartbeatLatestPost.alert_details ?? null
			});
			if (feedInsertErr) {
				errors.push({ route, stage: 'feed_insert', message: feedInsertErr.message });
				continue;
			}
			generated.push({ route, status: currentStatus, content: repostContent, quietRepost: true });
			continue;
		}

		if (!model) {
			errors.push({ route, stage: 'gemini', message: 'GEMINI_API_KEY not set' });
			continue;
		}

		const { data: history } = await supabase
			.from('train_status_logs')
			.select('status_text, created_at')
			.eq('line', route)
			.order('created_at', { ascending: false })
			.limit(3);

		const historyStr = (history || [])
			.map(h => `${h.status_text} (${new Date(h.created_at).toLocaleString()})`)
			.join(' → ');

		const { data: recentPosts } = await supabase
			.from('social_feed')
			.select('content')
			.eq('line', route)
			.order('created_at', { ascending: false })
			.limit(3);

		const prevPostsStr = (recentPosts || [])
			.map((p, i) => `${i + 1}. "${p.content}"`)
			.join('\n');

		const mtaAlertTypes = [...new Set(alerts.map(a => a.type))].join(', ');

		const persona = personas[route] || 'A New York City subway train.';
		const prompt = `You are the ${route} train on the NYC subway, posting on social media. Your personality: ${persona}

MTA status: ${mtaAlertTypes || 'Good Service'}
${currentReason ? `MTA alert details: ${currentReason}` : ''}
${historyStr ? `Recent status history: ${historyStr}` : 'This is the first status update.'}
${prevPostsStr ? `Your recent posts:\n${prevPostsStr}` : ''}

Write a single social media post (max 280 characters) reacting to your current status, fully in character. Be funny, specific to NYC, and stay in character. Do not use hashtags. Do not use quotation marks around the post. Do not repeat yourself from your recent posts. Just the post text, nothing else.`;

		try {
			const result = await model.generateContent(prompt);
			const content = result.response.text().trim().slice(0, 280);

			if (!skipDuplicateStatusLog) {
				const { error: logInsertErr } = await supabase.from('train_status_logs').insert({
					line: route,
					status_text: currentStatus,
					reason: currentReason
				});
				if (logInsertErr) {
					errors.push({ route, stage: 'log_insert', message: logInsertErr.message });
					continue;
				}
			}

			const { error: feedInsertErr } = await supabase.from('social_feed').insert({
				line: route,
				content,
				status_context: currentStatus,
				alert_details: currentReason
			});
			if (feedInsertErr) {
				errors.push({ route, stage: 'feed_insert', message: feedInsertErr.message });
				continue;
			}

			generated.push({ route, status: currentStatus, content });
		} catch (err) {
			errors.push({ route, stage: 'gemini', message: err.message });
		}
	}

	return json({ generated, count: generated.length, skipped, errors });
}
