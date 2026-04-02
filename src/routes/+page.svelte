<script>
	import { lineColors } from '$lib/colors.js';

	let { data } = $props();

	let expanded = $state({});

	function toggleExpand(route) {
		expanded = { ...expanded, [route]: !expanded[route] };
	}

	const lineGroups = [
		['1', '2', '3'],
		['4', '5', '6'],
		['7'],
		['A', 'C', 'E'],
		['B', 'D', 'F', 'M'],
		['G'],
		['J', 'Z'],
		['L'],
		['N', 'Q', 'R', 'W'],
		['S'],
	];

	function getGroupedTrains(trains) {
		const byRoute = {};
		for (const t of trains) {
			if (t) byRoute[t.route] = t;
		}
		return lineGroups
			.map(routes => {
				const members = routes.map(r => byRoute[r]).filter(Boolean);
				if (members.length === 0) return null;
				const statuses = new Set(members.map(m => m.statusDetails.statusSummary));
				const hasAnyAlerts = members.some(m => m.alerts && m.alerts.length > 0);
				const uniform = statuses.size === 1 && !hasAnyAlerts;

				let subgroups = [];
				if (!uniform) {
					const statusMap = {};
					for (const m of members) {
						const hasAlerts = m.alerts && m.alerts.length > 0;
						if (hasAlerts) {
							subgroups.push({ trains: [m], status: m.statusDetails.statusSummary, hasAlerts: true });
						} else {
							const key = m.statusDetails.statusSummary;
							if (!statusMap[key]) {
								statusMap[key] = { trains: [], status: key, hasAlerts: false };
							}
							statusMap[key].trains.push(m);
						}
					}
					const grouped = Object.values(statusMap);
					subgroups = [...grouped, ...subgroups.filter(s => s.hasAlerts)];
					subgroups.sort((a, b) => {
						const ai = members.findIndex(m => m.route === a.trains[0].route);
						const bi = members.findIndex(m => m.route === b.trains[0].route);
						return ai - bi;
					});
				}

				return { routes, members, uniform, status: members[0]?.statusDetails.statusSummary, subgroups };
			})
			.filter(Boolean);
	}

	let groups = $derived(getGroupedTrains(data.trains));

	function formatDate(dateStr) {
		if (!dateStr) return '';
		const d = new Date(dateStr);
		const month = ('0' + (d.getMonth() + 1)).slice(-2);
		const day = ('0' + d.getDate()).slice(-2);
		const year = d.getFullYear();
		let hours = d.getHours();
		const minutes = ('0' + d.getMinutes()).slice(-2);
		const ampm = hours >= 12 ? 'PM' : 'AM';
		hours = hours % 12 || 12;
		return `${month}/${day}/${year} ${hours}:${minutes} ${ampm}`;
	}
</script>

<div class="signage">
	{#each groups as group}
		<div class="signage-group">
		{#if group.uniform || group.members.length === 1}
			{@const solo = group.members.length === 1}
			{@const train0 = group.members[0]}
			{@const hasAlerts = solo && train0.alerts && train0.alerts.length > 0}
			<div
				class="signage-row"
				class:signage-row-clickable={hasAlerts}
				onclick={hasAlerts ? () => toggleExpand(train0.route) : undefined}
				role={hasAlerts ? 'button' : undefined}
				tabindex={hasAlerts ? 0 : undefined}
				onkeydown={hasAlerts ? (e) => { if (e.key === 'Enter') toggleExpand(train0.route); } : undefined}
			>
				<span class="signage-bullets">
					{#each group.members as train}
						<span class="signage-bullet" style="background-color: {lineColors[train.route] || '#888'}">{train.route}</span>
					{/each}
				</span>
				<span class="signage-status">{solo ? train0.statusDetails.statusSummary : group.status}</span>
			</div>
			{#if hasAlerts && expanded[train0.route]}
				<div class="signage-alerts">
					{#each train0.alerts as alert}
						<div class="signage-alert">
							<span class="signage-alert-type">{alert.type}</span>
							<div class="signage-alert-desc">{alert.description}</div>
							{#if alert.createdAt}
								<div class="signage-alert-date">{formatDate(alert.createdAt)}</div>
							{/if}
						</div>
					{/each}
				</div>
			{/if}
		{:else}
			<div class="signage-group-header">
				{#each group.members as train}
					<span class="signage-bullet" style="background-color: {lineColors[train.route] || '#888'}">{train.route}</span>
				{/each}
			</div>
			{#each group.subgroups as sub}
				{#if sub.hasAlerts}
					{@const train = sub.trains[0]}
					<div
						class="signage-detail-row signage-row-clickable"
						onclick={() => toggleExpand(train.route)}
						role="button"
						tabindex="0"
						onkeydown={(e) => { if (e.key === 'Enter') toggleExpand(train.route); }}
					>
						<span class="signage-bullet signage-bullet-sm" style="background-color: {lineColors[train.route] || '#888'}">{train.route}</span>
						<span class="signage-status-sm">{sub.status}</span>
					</div>
					{#if expanded[train.route]}
						<div class="signage-alerts">
							{#each train.alerts as alert}
								<div class="signage-alert">
									<span class="signage-alert-type">{alert.type}</span>
									<div class="signage-alert-desc">{alert.description}</div>
									{#if alert.createdAt}
										<div class="signage-alert-date">{formatDate(alert.createdAt)}</div>
									{/if}
								</div>
							{/each}
						</div>
					{/if}
				{:else}
					<div class="signage-detail-row">
						<span class="signage-detail-bullets">
							{#each sub.trains as train}
								<span class="signage-bullet signage-bullet-sm" style="background-color: {lineColors[train.route] || '#888'}">{train.route}</span>
							{/each}
						</span>
						<span class="signage-status-sm">{sub.status}</span>
					</div>
				{/if}
			{/each}
		{/if}
		</div>
	{/each}
</div>

<style>
	.signage-group {
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
		padding-bottom: 10px;
		margin-bottom: 2px;
	}

	.signage-row {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 10px 0 0 0;
	}

	.signage-bullets {
		display: flex;
		align-items: center;
		gap: 3px;
	}

	.signage-group-header {
		display: flex;
		align-items: center;
		gap: 3px;
		padding: 10px 0 6px 0;
	}

	.signage-detail-row {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 4px 0 4px 6px;
	}

	.signage-detail-bullets {
		display: flex;
		align-items: center;
		gap: 2px;
	}

	.signage-row-clickable {
		cursor: pointer;
	}

	.signage-bullet {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 42px;
		height: 42px;
		min-width: 42px;
		border-radius: 50%;
		color: #fff;
		font-size: 25px;
		font-weight: bold;
		line-height: 1;
	}

	.signage-bullet-sm {
		width: 26px;
		height: 26px;
		min-width: 26px;
		font-size: 15px;
	}

	.signage-status {
		font-size: 18px;
		font-weight: 700;
		color: rgba(255, 255, 255, 0.85);
	}

	.signage-status-sm {
		font-size: 18px;
		font-weight: 700;
		color: rgba(255, 255, 255, 0.85);
	}

	.signage-alerts {
		padding-left: 38px;
		margin-bottom: 6px;
	}

	.signage-alert {
		margin-bottom: 6px;
	}

	.signage-alert-type {
		font-size: 14px;
		font-weight: bold;
		color: rgba(255, 255, 255, 0.8);
	}

	.signage-alert-desc {
		font-size: 14px;
		font-weight: 400;
		line-height: 1.5;
		color: rgba(255, 255, 255, 0.6);
	}

	.signage-alert-date {
		font-size: 11px;
		color: rgba(255, 255, 255, 0.35);
		margin-top: 3px;
	}

	@media (min-width: 890px) {
		.signage-bullet {
			width: 52px;
			height: 52px;
			min-width: 52px;
			font-size: 30px;
		}
		.signage-bullet-sm {
			width: 30px;
			height: 30px;
			min-width: 30px;
			font-size: 17px;
		}
		.signage-status {
			font-size: 22px;
		}
		.signage-status-sm {
			font-size: 22px;
		}
		.signage-alerts {
			padding-left: 42px;
		}
	}
</style>
