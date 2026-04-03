import { createClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/private';

let client;

export function getSupabase() {
	if (!client) {
		const url = env.SUPABASE_URL;
		const key = env.SUPABASE_SERVICE_KEY;
		if (!url || !key) throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY');
		client = createClient(url, key);
	}
	return client;
}
