import { writable } from 'svelte/store';

export function createPlaintextStore(initial = false) {
	const store = writable(initial);

	return {
		subscribe: store.subscribe,
		set: store.set,
		update: store.update,
		toggle() {
			store.update(v => {
				const next = !v;
				document.cookie = `plaintext=${next ? '1' : '0'}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
				return next;
			});
		}
	};
}
