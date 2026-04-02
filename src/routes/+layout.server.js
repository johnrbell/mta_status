import { getBgImg } from '$lib/background.js';

export async function load({ cookies }) {
	const bgImg = await getBgImg();
	const bgMode = parseInt(cookies.get('bg') || '0', 10);
	return { bgImg, bgMode };
}
