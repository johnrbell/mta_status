import { getBgImg } from '$lib/background.js';

export async function load({ cookies }) {
	const bgImg = await getBgImg();
	const bgVisible = cookies.get('bg') === '1';
	return { bgImg, bgVisible };
}
