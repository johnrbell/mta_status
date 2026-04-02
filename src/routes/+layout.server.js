import { getBgImg } from '$lib/background.js';

export async function load({ cookies }) {
	const bgImg = await getBgImg();
	const plaintextMode = cookies.get('plaintext') === '1';
	return { bgImg, plaintextMode };
}
