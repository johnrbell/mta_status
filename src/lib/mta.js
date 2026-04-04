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
	switch (status) {
		case 'Planned - Suspended':
			return 'suspended.';
		case 'Planned - Part Suspended':
			return 'part suspended.';
		case 'Planned - Reroute':
			return 'rerouted.';
		case 'Planned - Stops Skipped':
			return 'stops skipped.';
		case 'Planned - Express to Local':
			return 'express to local.';
		case 'Severe Delays':
		case 'Delays':
			return 'trains cooked.';
		case 'Slow Speeds':
		case 'Reduced Service':
			return 'sorta cooked.';
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
			if (status.startsWith('Planned')) return 'planned work.';
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

function formatPeriods(periods) {
	if (!periods.length) return null;
	const sorted = periods
		.map((p) => ({ start: p.start || 0, end: p.end || null }))
		.filter((p) => p.start)
		.sort((a, b) => a.start - b.start);
	if (!sorted.length) return null;

	const fmt = (ts) => {
		const d = new Date(ts * 1000);
		const day = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
		const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
		return `${day} ${time}`;
	};

	const first = sorted[0];
	const last = sorted[sorted.length - 1];
	if (last.end) {
		return `${fmt(first.start)} to ${fmt(last.end)}`;
	}
	return `Starting ${fmt(first.start)}`;
}

export function processAlerts(feedData) {
	const now = Date.now() / 1000;
	const activeAlerts = {};
	const upcomingAlerts = {};

	for (const e of feedData.entity || []) {
		const alert = e.alert;
		const mercury = alert['transit_realtime.mercury_alert'];
		const alertType = mercury ? mercury.alert_type : null;
		if (!alertType) continue;

		const periods = alert.active_period || [];
		const isActive = periods.some((p) => {
			const start = p.start || 0;
			const end = p.end || Infinity;
			return now >= start && now <= end;
		});

		const isPlanned = alertType.startsWith('Planned');
		const upcomingHorizon = 6 * 60 * 60;
		const hasUpcoming = isPlanned && periods.some((p) => {
			const start = p.start || 0;
			return start > now && start <= now + upcomingHorizon;
		});

		if (!isActive && !hasUpcoming) continue;

		let headerText = '';
		if (alert.header_text && alert.header_text.translation) {
			const en = alert.header_text.translation.find((t) => t.language === 'en');
			if (en) headerText = en.text;
		}
		const createdAt = mercury.created_at ? new Date(mercury.created_at * 1000) : null;

		let upcomingStart = null;
		if (!isActive && hasUpcoming) {
			const futureStarts = periods
				.map((p) => p.start || 0)
				.filter((s) => s > now && s <= now + upcomingHorizon);
			upcomingStart = new Date(Math.min(...futureStarts) * 1000);
		}

			const periodText = formatPeriods(periods);

		for (const ie of alert.informed_entity || []) {
			if (ie.route_id && allRoutes.includes(ie.route_id)) {
				const alertObj = {
					type: alertType,
					description: headerText,
					createdAt,
					upcoming: !isActive && hasUpcoming,
					upcomingStart,
					periodText
				};
				const bucket = isActive ? activeAlerts : upcomingAlerts;
				if (!bucket[ie.route_id]) bucket[ie.route_id] = [];
				bucket[ie.route_id].push(alertObj);
			}
		}
	}

	const trains = [];
	for (const route of allRoutes) {
		const active = activeAlerts[route] || [];
		const upcoming = upcomingAlerts[route] || [];
		const allAlerts = [...active, ...upcoming];

		let status;
		if (active.length > 0) {
			status = mapStatus(pickWorstStatus(active.map((a) => a.type)));
		} else if (upcoming.length > 0) {
			status = mapStatus(pickWorstStatus(upcoming.map((a) => a.type)));
		} else {
			status = 'all good.';
		}

		trains[sortOrder[route]] = { route, statusDetails: { statusSummary: status }, alerts: allAlerts };
	}

	return { trains, cacheTime: new Date() };
}

const MTA_URL =
	'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/camsys%2Fsubway-alerts.json';
const CACHE_TTL = 300;

let cachedData = null;

let inflight = null;

export async function fetchTrainData({ bypassCache = false } = {}) {
	if (!bypassCache && cachedData && (Date.now() - cachedData.cacheTime.getTime()) / 1000 < CACHE_TTL) {
		return cachedData;
	}

	if (inflight) return inflight;

	inflight = (async () => {
		try {
			const res = await fetch(MTA_URL, { signal: AbortSignal.timeout(10000) });
			if (!res.ok) throw new Error('MTA API returned ' + res.status);
			const json = await res.json();
			cachedData = processAlerts(json);
			return cachedData;
		} finally {
			inflight = null;
		}
	})();

	return inflight;
}
