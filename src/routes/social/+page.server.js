import { getSupabase } from '$lib/supabase.js';

export async function load() {
	const supabase = getSupabase();

	const { data: posts, error } = await supabase
		.from('social_feed')
		.select('id, line, content, status_context, alert_details, created_at')
		.order('created_at', { ascending: false })
		.limit(50);

	if (error) {
		console.error('Failed to load social feed:', error.message);
		return { posts: [] };
	}

	return { posts: posts || [] };
}
