import { redirect, error } from '@sveltejs/kit';
import { allRoutes } from '$lib/mta.js';

export function load({ params }) {
	const name = params.name.toUpperCase();
	if (allRoutes.includes(name)) {
		redirect(302, '/');
	}
	error(404, { message: params.name });
}
