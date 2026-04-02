import { writable } from 'svelte/store';

// 0 = black, 1 = photo, 2 = subway animation
export function createBgStore(initial = 0) {
	const store = writable(initial);

	return {
		subscribe: store.subscribe,
		set: store.set,
		update: store.update,
		setMode(mode) {
			store.set(mode);
			document.cookie = `bg=${mode}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
		}
	};
}
