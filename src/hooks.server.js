/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
	const host = event.request.headers.get('host') ?? '';

	if (host === 'mta.social' || host === 'www.mta.social') {
		const url = new URL(event.request.url);

		if (url.pathname === '/' || url.pathname === '') {
			url.pathname = '/social';
			event = { ...event, url };
		}
	}

	return resolve(event);
}
