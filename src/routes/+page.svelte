<script>
	import { lineColors } from '$lib/colors.js';

	let { data } = $props();

	let expanded = $state({});

	function toggleExpand(route) {
		if (expanded[route]) {
			expanded = { ...expanded, [route]: false };
		} else {
			expanded = { [route]: true };
		}
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

	function byRoute(trains) {
		const map = {};
		for (const t of trains) {
			if (t) map[t.route] = t;
		}
		return map;
	}

	let trainMap = $derived(byRoute(data.trains));

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

<div class="container">
	{#each lineGroups as group}
		{@const members = group.map(r => trainMap[r]).filter(Boolean)}
		{@const expandedTrain = members.find(m => expanded[m.route] && m.alerts?.length > 0)}
		<div class="row">
			{#each members as train}
				{@const hasAlerts = train.alerts && train.alerts.length > 0}
				<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
				<div
					class="train"
					class:has-alerts={hasAlerts}
					onclick={hasAlerts ? () => toggleExpand(train.route) : undefined}
					role={hasAlerts ? 'button' : undefined}
					tabindex={hasAlerts ? 0 : undefined}
					onkeydown={hasAlerts ? (e) => { if (e.key === 'Enter') toggleExpand(train.route); } : undefined}
				>
					<div class="circle" style="background-color: {lineColors[train.route] || '#888'}">
						<span class="letter">{train.route}</span>
					</div>
					<div class="status">{train.statusDetails.statusSummary}</div>
				</div>
			{/each}
		</div>
		{#if expandedTrain}
			<div class="alerts">
				<div class="alerts-header">
					<span class="alerts-circle" style="background-color: {lineColors[expandedTrain.route] || '#888'}">{expandedTrain.route}</span>
					Alerts
				</div>
				{#each expandedTrain.alerts as alert}
					<div class="alert-item">
						<span class="alert-type">{alert.type}</span>
						<div class="alert-desc">{alert.description}</div>
						{#if alert.createdAt}
							<div class="alert-date">{formatDate(alert.createdAt)}</div>
						{/if}
					</div>
				{/each}
			</div>
		{/if}
	{/each}
</div>

<style>
	.container {
		position: relative;
		max-width: 1200px;
		margin: 10px auto 0 auto;
	}

	.row {
		display: flex;
		justify-content: flex-start;
		gap: 2px;
		margin-bottom: 12px;
		flex-wrap: wrap;
	}

	.train {
		display: inline-flex;
		flex-direction: column;
		align-items: center;
		width: 62px;
	}

	.has-alerts {
		cursor: pointer;
	}

	.circle {
		width: 50px;
		height: 50px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.letter {
		font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
		font-weight: 500;
		font-size: 35px;
		color: #fff;
		line-height: 1;
	}

	.status {
		font-size: 13px;
		font-weight: 700;
		color: rgba(255, 255, 255, 0.85);
		margin-top: 3px;
		text-align: center;
		line-height: 1.2;
	}

	.alerts {
		text-align: left;
		padding: 12px 16px 16px 16px;
		margin: -12px auto 20px auto;
		max-width: 500px;
		background: rgba(255, 255, 255, 0.06);
		border-radius: 10px;
		border: 1px solid rgba(255, 255, 255, 0.08);
	}

	.alerts-header {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 16px;
		font-weight: 700;
		margin-bottom: 10px;
		padding-bottom: 8px;
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	}

	.alerts-circle {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 24px;
		height: 24px;
		border-radius: 50%;
		color: #fff;
		font-size: 14px;
		font-weight: bold;
	}

	.alert-item {
		margin-bottom: 10px;
	}

	.alert-item:last-child {
		margin-bottom: 0;
	}

	.alert-type {
		font-size: 14px;
		font-weight: bold;
		color: rgba(255, 255, 255, 0.8);
	}

	.alert-desc {
		font-size: 14px;
		font-weight: 400;
		line-height: 1.5;
		color: rgba(255, 255, 255, 0.6);
	}

	.alert-date {
		font-size: 11px;
		color: rgba(255, 255, 255, 0.35);
		margin-top: 3px;
	}

	@media (min-width: 890px) {
		.row {
			gap: 16px;
			margin-bottom: 40px;
		}
		.train {
			width: 100px;
		}
		.circle {
			width: 75px;
			height: 75px;
		}
		.letter {
			font-size: 52px;
		}
		.status {
			font-size: 18px;
			margin-top: 7px;
		}
	}
</style>
