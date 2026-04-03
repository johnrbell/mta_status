import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { fetchTrainData, allRoutes } from '$lib/mta.js';
import { getSupabase } from '$lib/supabase.js';
import { personas } from '$lib/personas.js';

export async function POST({ request }) {
	const secret = request.headers.get('x-cron-secret');
	if (!env.CRON_SECRET || secret !== env.CRON_SECRET) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const supabase = getSupabase();
	const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
	const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

	let trainData;
	try {
		trainData = await fetchTrainData();
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

		const { data: lastLog, error: logError } = await supabase
			.from('train_status_logs')
			.select('status_text')
			.eq('line', route)
			.order('created_at', { ascending: false })
			.limit(1)
			.maybeSingle();

		if (logError) {
			errors.push({ route, stage: 'dedup_query', message: logError.message });
			continue;
		}

		if (lastLog && lastLog.status_text === currentStatus) {
			skipped++;
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

		const alertDescs = (train.alerts || [])
			.map(a => a.description)
			.filter(Boolean)
			.join('; ');

		const persona = personas[route] || 'A New York City subway train.';
		const prompt = `You are the ${route} train on the NYC subway, posting on social media. Your personality: ${persona}

Current status: ${currentStatus}
${alertDescs ? `MTA alert details: ${alertDescs}` : ''}
${historyStr ? `Recent status history: ${historyStr}` : 'This is the first status update.'}

Write a single social media post (max 280 characters) reacting to your current status, fully in character. Be funny, specific to NYC, and stay in character. Do not use hashtags. Do not use quotation marks around the post. Just the post text, nothing else.`;

		try {
			const result = await model.generateContent(prompt);
			const content = result.response.text().trim().slice(0, 280);

			const { error: logInsertErr } = await supabase.from('train_status_logs').insert({
				line: route,
				status_text: currentStatus,
				reason: alertDescs || null
			});
			if (logInsertErr) {
				errors.push({ route, stage: 'log_insert', message: logInsertErr.message });
				continue;
			}

			const { error: feedInsertErr } = await supabase.from('social_feed').insert({
				line: route,
				content,
				status_context: currentStatus,
				alert_details: alertDescs || null
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
