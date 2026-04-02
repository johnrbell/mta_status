import { getBgImg } from '$lib/background.js';

export async function load({ cookies }) {
	const bgImg = await getBgImg();
	const raw = parseInt(cookies.get('bg') || '0', 10);
	const bgMode = [0, 1, 2].includes(raw) ? raw : 0;
	return { bgImg, bgMode };
}
