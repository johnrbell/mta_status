<script>
	import { lineColors } from '$lib/colors.js';
	import { getContext } from 'svelte';

	const plaintext = getContext('plaintext');

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

	let modalOpen = $state(false);
	let modalRoute = $state('');
	let modalAlerts = $state([]);
	let modalColor = $state('');

	function openModal(train) {
		if (!train.alerts || train.alerts.length === 0) return;
		modalRoute = train.route;
		modalAlerts = train.alerts;
		modalColor = lineColors[train.route] || '#888';
		modalOpen = true;
	}

	function closeModal() {
		modalOpen = false;
	}

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

	function handleKeydown(e) {
		if (e.key === 'Escape') closeModal();
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if $plaintext}
<div class="signage">
	{#each groups as group}
		{#if group.uniform}
			<div class="signage-row">
				<span class="signage-bullets">
					{#each group.members as train}
						<span class="signage-bullet" style="background-color: {lineColors[train.route] || '#888'}">{train.route}</span>
					{/each}
				</span>
				<span class="signage-status">{group.status}</span>
			</div>
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
	{/each}
</div>
{:else}
<div class="container">
	{#each data.trains as train}
		{#if train}
			{#if train.route === 'A' || train.route === 'G'}
				<br class="for_desktop" />
			{/if}
			<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
			<div
				class="trainname"
				class:has-alerts={train.alerts && train.alerts.length > 0}
				style="background-color: {lineColors[train.route] || '#888'}"
				onclick={() => openModal(train)}
				role={train.alerts?.length > 0 ? 'button' : undefined}
				tabindex={train.alerts?.length > 0 ? 0 : undefined}
				onkeydown={(e) => { if (e.key === 'Enter') openModal(train); }}
			>
				<div class="letter">{train.route}</div>
				<div class="status">{train.statusDetails.statusSummary}</div>
			</div>
		{/if}
	{/each}
</div>

<div class="hint">click a train for more info</div>

{#if modalOpen}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<div class="modal-overlay" onclick={closeModal} role="presentation">
		<!-- svelte-ignore a11y_interactive_supports_focus -->
		<div class="modal" onclick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
			<div class="modal-header">
				<span class="modal-title">
					Active Alerts for
					<span class="modal-route-circle" style="background-color: {modalColor}">
						{modalRoute}
					</span>
				</span>
				<span
					class="modal-close"
					onclick={closeModal}
					role="button"
					tabindex="0"
					onkeydown={(e) => { if (e.key === 'Enter') closeModal(); }}
				>&times;</span>
			</div>
			<div class="modal-body">
				{#each modalAlerts as alert}
					<div class="modal-alert">
						<div class="modal-alert-type">{alert.type}</div>
						<div class="modal-alert-desc">{alert.description}</div>
						{#if alert.createdAt}
							<div class="modal-alert-date">Posted: {formatDate(alert.createdAt)}</div>
						{/if}
					</div>
				{/each}
			</div>
		</div>
	</div>
{/if}
{/if}

<style>
	/* Signage mode */
	.signage-row {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 10px 0;
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
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

	.signage-detail-row:last-of-type {
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
		padding-bottom: 10px;
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
		font-size: 26px;
		font-weight: 700;
		color: #fff;
	}

	.signage-status-sm {
		font-size: 18px;
		font-weight: 500;
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
			font-size: 32px;
		}
		.signage-status-sm {
			font-size: 22px;
		}
		.signage-alerts {
			padding-left: 42px;
		}
	}

	.container {
		position: relative;
		max-width: 1200px;
		text-align: center;
		margin: 40px auto 0 auto;
	}

	.trainname {
		display: inline-block;
		vertical-align: top;
		width: 50px;
		height: 50px;
		border-radius: 50%;
		margin: 0 10px 50px 10px;
		position: relative;
	}

	.has-alerts {
		cursor: pointer;
	}

	.letter {
		width: 50px;
		font-size: 35px;
		font-family: 'Helvetica Neue', 'Helvetica', Arial, sans-serif;
		font-weight: 500;
		background-color: transparent;
		padding-top: 4px;
		line-height: 1.2;
		text-align: center;
	}

	.status {
		font-size: 14px;
		color: #fff;
		padding-top: 5px;
		width: 80px;
		margin-left: -15px;
		text-align: center;
	}

	.for_desktop {
		display: none;
	}

	.hint {
		text-align: center;
		font-size: 15px;
		color: rgba(255, 255, 255, 0.83);
		margin: 10px auto 0 auto;
		font-weight: 400;
		background: rgba(0, 0, 0, 0.55);
		padding: 6px 16px;
		border-radius: 20px;
		border: 1px solid #777;
		width: fit-content;
	}

	/* Modal */
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.5);
		z-index: 9999;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.modal {
		background: rgba(30, 30, 30, 0.85);
		color: #fff;
		border-radius: 12px;
		width: calc(100% - 32px);
		max-width: 500px;
		max-height: 80vh;
		overflow-y: auto;
		padding: 28px;
		box-sizing: border-box;
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		border: 1px solid rgba(255, 255, 255, 0.1);
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20px;
		padding-bottom: 16px;
		border-bottom: 1px solid rgba(255, 255, 255, 0.15);
	}

	.modal-title {
		font-size: 20px;
		font-weight: lighter;
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.modal-close {
		font-size: 32px;
		color: rgba(255, 255, 255, 0.5);
		cursor: pointer;
		font-weight: 300;
		line-height: 1;
		transition: color 0.2s;
	}

	.modal-close:hover {
		color: #fff;
	}

	.modal-route-circle {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		border-radius: 50%;
		color: #fff;
		font-size: 19px;
		font-weight: bold;
	}

	.modal-alert {
		border-top: 1px solid rgba(255, 255, 255, 0.1);
		padding: 18px 0;
	}

	.modal-alert:first-child {
		border-top: none;
	}

	.modal-alert-type {
		font-size: 16px;
		font-weight: bold;
		margin-bottom: 10px;
		color: #ffcc00;
	}

	.modal-alert-desc {
		font-size: 14px;
		line-height: 1.6;
		margin-bottom: 10px;
		color: rgba(255, 255, 255, 0.85);
	}

	.modal-alert-date {
		font-size: 12px;
		color: rgba(255, 255, 255, 0.35);
	}

	@media (min-width: 890px) {
		.trainname {
			width: 75px;
			height: 75px;
			margin: 0 20px 75px 20px;
		}
		.letter {
			width: 75px;
			font-size: 52px;
			line-height: normal;
		}
		.status {
			font-size: 20px;
			padding-top: 7px;
			width: 120px;
			margin-left: -20px;
			text-align: center;
		}
		.for_desktop {
			display: block;
		}
	}
</style>
