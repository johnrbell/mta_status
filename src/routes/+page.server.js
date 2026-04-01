import { fetchTrainData } from '$lib/mta.js';

export async function load() {
	const data = await fetchTrainData();
	return {
		trains: data.trains,
		cacheTime: data.cacheTime.toISOString()
	};
}
