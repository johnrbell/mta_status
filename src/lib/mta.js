const severityOrder = [
	'No Scheduled Service',
	'Station Notice',
	'Boarding Change',
	'Special Schedule',
	'Extra Service',
	'Planned - Stops Skipped',
	'Planned - Express to Local',
	'Planned - Reroute',
	'Planned - Part Suspended',
	'Planned - Suspended',
	'Reduced Service',
	'Slow Speeds',
	'Delays',
	'Severe Delays'
];

function pickWorstStatus(types) {
	let worst = types[0];
	let worstIndex = severityOrder.indexOf(worst);
	for (const t of types) {
		const idx = severityOrder.indexOf(t);
		if (idx > worstIndex) {
			worst = t;
			worstIndex = idx;
		}
	}
	return worst;
}

function mapStatus(status) {
	if (status.startsWith('Planned')) return 'planned work.';
	switch (status) {
		case 'Severe Delays':
			return 'delayed af.';
		case 'Delays':
			return 'delayed af.';
		case 'Slow Speeds':
			return 'slow af.';
		case 'Reduced Service':
			return 'reduced service.';
		case 'No Scheduled Service':
			return 'no service.';
		case 'Boarding Change':
			return 'boarding change.';
		case 'Extra Service':
			return 'extra service.';
		case 'Station Notice':
			return 'station notice.';
		case 'Special Schedule':
			return 'special schedule.';
		default:
			return status.toLowerCase() + '.';
	}
}

export const allRoutes = [
	'1', '2', '3', '4', '5', '6', '7',
	'A', 'C', 'E', 'B', 'D', 'F', 'M',
	'G', 'J', 'Z', 'L', 'N', 'Q', 'R', 'W', 'S'
];

const sortOrder = {
	'1': 0, '2': 1, '3': 2, '4': 3, '5': 4, '6': 5, '7': 6,
	'A': 7, 'C': 8, 'E': 9, 'B': 10, 'D': 11, 'F': 12, 'M': 13,
	'G': 14, 'J': 15, 'Z': 16, 'L': 17, 'N': 18, 'Q': 19, 'R': 20, 'W': 21, 'S': 22
};

export function processAlerts(feedData) {
	const now = Date.now() / 1000;
	const routeAlerts = {};

	for (const e of feedData.entity) {
		const alert = e.alert;
		const mercury = alert['transit_realtime.mercury_alert'];
		const alertType = mercury ? mercury.alert_type : null;
		if (!alertType) continue;

		const active = (alert.active_period || []).some((p) => {
			const start = p.start || 0;
			const end = p.end || Infinity;
			return now >= start && now <= end;
		});
		if (!active) continue;

		let headerText = '';
		if (alert.header_text && alert.header_text.translation) {
			const en = alert.header_text.translation.find((t) => t.language === 'en');
			if (en) headerText = en.text;
		}
		const createdAt = mercury.created_at ? new Date(mercury.created_at * 1000) : null;

		for (const ie of alert.informed_entity || []) {
			if (ie.route_id && allRoutes.includes(ie.route_id)) {
				if (!routeAlerts[ie.route_id]) routeAlerts[ie.route_id] = [];
				routeAlerts[ie.route_id].push({
					type: alertType,
					description: headerText,
					createdAt
				});
			}
		}
	}

	const trains = [];
	for (const route of allRoutes) {
		const alerts = routeAlerts[route] || [];
		const status =
			alerts.length > 0
				? mapStatus(pickWorstStatus(alerts.map((a) => a.type)))
				: 'all good.';
		trains[sortOrder[route]] = { route, statusDetails: { statusSummary: status }, alerts };
	}

	return { trains, cacheTime: new Date() };
}

const MTA_URL =
	'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/camsys%2Fsubway-alerts.json';
const CACHE_TTL = 300;

let cachedData = null;

export async function fetchTrainData() {
	if (cachedData && (Date.now() - cachedData.cacheTime.getTime()) / 1000 < CACHE_TTL) {
		return cachedData;
	}

	const res = await fetch(MTA_URL);
	if (!res.ok) throw new Error('MTA API returned ' + res.status);
	const json = await res.json();
	cachedData = processAlerts(json);
	return cachedData;
}
