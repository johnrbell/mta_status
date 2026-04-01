import { getBgImg } from '$lib/background.js';

export async function load() {
	const bgImg = await getBgImg();
	return { bgImg };
}
