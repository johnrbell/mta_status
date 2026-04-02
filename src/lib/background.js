import fs from 'node:fs/promises';
import path from 'node:path';
import { env } from '$env/dynamic/private';

const BG_DIR = path.join(process.cwd(), 'static', 'img', 'bg');
const CACHE_TTL = 300;

const defaultImages = [
	'https://images.unsplash.com/photo-1470290032981-3371c20736f6?w=1600&h=1200&fit=crop',
	'https://images.unsplash.com/photo-1465487438571-59340bfc35dd?w=1600&h=1200&fit=crop',
	'https://images.unsplash.com/photo-1433437728106-854c6e19699c?w=1600&h=1200&fit=crop',
	'https://images.unsplash.com/photo-1467250123231-1813550b3fd5?w=1600&h=1200&fit=crop',
	'https://images.unsplash.com/photo-1428976365951-b70e0fa5c551?w=1600&h=1200&fit=crop',
	'https://images.unsplash.com/39/mtNrf7oxS4uSxTzMBWfQ_DSC_0043.jpg?w=1600&h=1200&fit=crop',
	'https://images.unsplash.com/photo-1463267511177-6ae5f8c670d4?w=1600&h=1200&fit=crop',
	'https://images.unsplash.com/photo-1414496213569-23220f1033cd?w=1600&h=1200&fit=crop',
	'https://images.unsplash.com/photo-1466500419182-8602dc906b51?w=1600&h=1200&fit=crop',
	'https://images.unsplash.com/photo-1464225495945-af130cc9f19e?w=1600&h=1200&fit=crop'
];

function randomDefault() {
	return defaultImages[Math.floor(Math.random() * defaultImages.length)];
}

async function newestImage() {
	try {
		const files = (await fs.readdir(BG_DIR)).filter((f) => f.endsWith('.jpg'));
		if (files.length === 0) return null;
		files.sort();
		return files[files.length - 1];
	} catch {
		await fs.mkdir(BG_DIR, { recursive: true }).catch(() => {});
		return null;
	}
}

async function cachedImageFresh() {
	const file = await newestImage();
	if (!file) return false;
	const timestamp = parseInt(file.replace('.jpg', ''));
	return Date.now() / 1000 - timestamp < CACHE_TTL;
}

let memoryCache = { url: null, timestamp: 0 };

export async function getBgImg() {
	try {
		if (await cachedImageFresh()) {
			return '/img/bg/' + await newestImage();
		}
	} catch {
		// Filesystem not available (e.g. Vercel)
	}

	if (memoryCache.url && Date.now() / 1000 - memoryCache.timestamp < CACHE_TTL) {
		return memoryCache.url;
	}

	try {
		const unsplashKey = env.UNSPLASH_ACCESS_KEY;
		if (!unsplashKey) throw new Error('No Unsplash key');

		const params = new URLSearchParams({
			query: 'new york city buildings',
			orientation: 'landscape',
			w: '1600',
			h: '1200'
		});
		const searchRes = await fetch('https://api.unsplash.com/photos/random?' + params, {
			headers: { Authorization: 'Client-ID ' + unsplashKey }
		});
		if (!searchRes.ok) throw new Error('Unsplash returned ' + searchRes.status);
		const data = await searchRes.json();
		const imgUrl = data.urls.regular;

		try {
			const old = await newestImage();
			if (old) await fs.unlink(path.join(BG_DIR, old));
			const filename = Math.floor(Date.now() / 1000) + '.jpg';
			const imgRes = await fetch(imgUrl);
			if (imgRes.ok) {
				const buffer = Buffer.from(await imgRes.arrayBuffer());
				await fs.writeFile(path.join(BG_DIR, filename), buffer);
				return '/img/bg/' + filename;
			}
		} catch {
			// Disk write failed, use URL directly
		}

		memoryCache = { url: imgUrl, timestamp: Date.now() / 1000 };
		return imgUrl;
	} catch (err) {
		console.log('BG image error:', err.message);
		const url = randomDefault();
		memoryCache = { url, timestamp: Date.now() / 1000 };
		return url;
	}
}
