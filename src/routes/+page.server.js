import { getSupabase } from '$lib/supabase.js';
import { allRoutes } from '$lib/mta.js';

const FEED_SELECT = 'id, line, content, status_context, alert_details, created_at';

/** Recent global activity; merged with latest post per line so every route with data stays visible. */
const RECENT_POSTS_LIMIT = 25;

export async function load() {
	const supabase = getSupabase();

	const [recentRes, ...perLineRes] = await Promise.all([
		supabase.from('social_feed').select(FEED_SELECT).order('created_at', { ascending: false }).limit(RECENT_POSTS_LIMIT),
		...allRoutes.map((line) =>
			supabase.from('social_feed').select(FEED_SELECT).eq('line', line).order('created_at', { ascending: false }).limit(1).maybeSingle()
		)
	]);

	if (recentRes.error) {
		console.error('Failed to load social feed:', recentRes.error.message);
		return { posts: [] };
	}

	const byId = new Map();
	for (const p of recentRes.data || []) {
		byId.set(p.id, p);
	}

	for (const res of perLineRes) {
		if (res.error) {
			console.error('Failed to load per-line social post:', res.error.message);
			continue;
		}
		const row = res.data;
		if (row && !byId.has(row.id)) {
			byId.set(row.id, row);
		}
	}

	const posts = [...byId.values()].sort(
		(a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
	);

	return { posts };
}
