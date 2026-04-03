/** @type {import('@sveltejs/kit').Reroute} */
export function reroute({ url }) {
	if (url.host === 'mta.social' || url.host === 'www.mta.social') {
		if (url.pathname === '/') {
			return '/social';
		}
	}
}
