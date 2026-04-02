<script>
	import { beforeNavigate, afterNavigate, invalidateAll } from '$app/navigation';
	import { setContext } from 'svelte';
	import { createPlaintextStore } from '$lib/mode.js';

	let { children, data } = $props();

	const plaintext = createPlaintextStore(data.plaintextMode);
	setContext('plaintext', plaintext);

	$effect(() => {
		document.documentElement.style.backgroundColor = $plaintext ? '#000' : '';
		document.body.style.backgroundColor = $plaintext ? '#000' : '';
	});

	let loading = $state(false);
	let loadStart = 0;
	const MIN_DURATION = 250;

	function showLoader() {
		loading = true;
		loadStart = Date.now();
	}

	function hideLoader() {
		const elapsed = Date.now() - loadStart;
		const remaining = Math.max(0, MIN_DURATION - elapsed);
		setTimeout(() => { loading = false; }, remaining);
	}

	beforeNavigate(() => showLoader());
	afterNavigate(() => hideLoader());

	async function handleLogoClick(e) {
		e.preventDefault();
		showLoader();
		await invalidateAll();
		hideLoader();
	}
</script>

{#if $plaintext}
	{#if loading}
		<div class="signage-loader-overlay">
			<svg class="signage-spinner" viewBox="0 0 50 50">
				<circle cx="25" cy="25" r="20" />
			</svg>
		</div>
	{/if}
	<div class="plaintext-wrap">
		<a href="/" class="signage-header" onclick={handleLogoClick}>Mta Status</a>
		<div class="signage-subheader">Subway, at a glance.</div>
		{@render children()}
	</div>
{:else}
	<div class="normal-wrap">
		{#if loading}
			<div class="loader-overlay">
				<div class="loader-ring">
					<svg class="loader-svg" viewBox="0 0 100 100">
						<circle class="loader-track" cx="50" cy="50" r="46" />
						<circle class="loader-progress" cx="50" cy="50" r="46" />
					</svg>
					<img src="/img/icons/apple-icon-180x180.png" alt="Loading" class="loader-icon" />
				</div>
			</div>
		{/if}

		<div class="header">
			<h1><a href="/" onclick={handleLogoClick}>MTA STATUS</a></h1>
			<h2>Subway, at a glance.</h2>
		</div>

		{@render children()}

		<div class="bg" style="background-image: url({data.bgImg})"></div>
		<div class="screen"></div>
	</div>
{/if}

<!-- svelte-ignore a11y_click_events_have_key_events -->
<div
	class="toggle"
	class:toggle-on={$plaintext}
	onclick={plaintext.toggle}
	role="switch"
	aria-checked={$plaintext}
	tabindex="0"
	onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); plaintext.toggle(); } }}
>
	<div class="toggle-thumb"></div>
</div>

<style>
	:global(html), :global(body) {
		margin: 0;
		padding: 0;
		font-family: 'Helvetica Neue', Arial, sans-serif;
		color: white;
	}

	:global(a) {
		color: white;
	}

	.normal-wrap {
		-webkit-user-select: none;
		user-select: none;
		-webkit-tap-highlight-color: transparent;
		-webkit-touch-callout: none;
		overscroll-behavior: none;
		-webkit-overflow-scrolling: touch;
		min-height: 100vh;
	}

	.screen {
		inset: 0;
		background-color: #222;
		opacity: 0.7;
		position: fixed;
		z-index: -1;
	}

	.bg {
		inset: 0;
		background-color: #333;
		background-size: cover;
		background-position: center center;
		background-repeat: no-repeat;
		z-index: -2;
		position: fixed;
		text-align: center;
	}

	.header {
		text-align: center;
		width: 100%;
		height: auto;
		margin-top: 10px;
		margin-bottom: 10px;
		padding: 0;
	}

	.header h1 {
		padding-top: 10px;
		font-size: 14vw;
		line-height: 0px;
		font-weight: lighter;
	}

	.header h1 a {
		color: #fff;
		text-decoration: none;
	}

	.header h2 {
		font-size: 7.5vw;
		line-height: 15px;
		font-weight: lighter;
	}

	.loader-overlay {
		position: fixed;
		inset: 0;
		z-index: 99999;
		background: rgba(0, 0, 0, 0.7);
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.loader-ring {
		position: relative;
		width: 96px;
		height: 96px;
	}

	.loader-svg {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		transform: rotate(-90deg);
	}

	.loader-track {
		fill: none;
		stroke: rgba(255, 255, 255, 0.15);
		stroke-width: 4;
	}

	.loader-progress {
		fill: none;
		stroke: #FF8844;
		stroke-width: 4;
		stroke-linecap: round;
		stroke-dasharray: 289;
		stroke-dashoffset: 289;
		animation: wrap 0.25s linear forwards;
	}

	@keyframes wrap {
		to { stroke-dashoffset: 0; }
	}

	.loader-icon {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 76px;
		height: 76px;
		border-radius: 50%;
	}

	@media (min-width: 890px) {
		.header h1 {
			font-size: 120px;
		}
		.header h2 {
			font-size: 40px;
		}
	}

	/* Signage loader */
	.signage-loader-overlay {
		position: fixed;
		inset: 0;
		z-index: 99999;
		background: rgba(0, 0, 0, 0.85);
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.signage-spinner {
		width: 48px;
		height: 48px;
		animation: signage-spin 0.8s linear infinite;
	}

	.signage-spinner circle {
		fill: none;
		stroke: #fff;
		stroke-width: 4;
		stroke-linecap: round;
		stroke-dasharray: 90 126;
	}

	@keyframes signage-spin {
		to { transform: rotate(360deg); }
	}

	/* Signage mode */
	.plaintext-wrap {
		font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
		color: #fff;
		background: #000;
		min-height: 100vh;
		padding: 28px 24px;
		box-sizing: border-box;
		max-width: 600px;
		margin: 0 auto;
	}

	.signage-header {
		display: block;
		font-size: 42px;
		font-weight: 700;
		letter-spacing: 0.01em;
		margin-bottom: 4px;
		line-height: 1.1;
		text-decoration: none;
		color: #fff;
		cursor: pointer;
	}

	.signage-subheader {
		font-size: 24px;
		font-weight: 400;
		margin-bottom: 28px;
		line-height: 1.2;
	}

	@media (min-width: 890px) {
		.plaintext-wrap {
			padding: 40px 48px;
			max-width: 700px;
		}
		.signage-header {
			font-size: 56px;
			margin-bottom: 6px;
		}
		.signage-subheader {
			font-size: 32px;
			margin-bottom: 36px;
		}
	}

	/* Toggle */
	.toggle {
		position: fixed;
		bottom: 8px;
		right: 20px;
		z-index: 100000;
		width: 34px;
		height: 20px;
		border-radius: 12px;
		background: rgba(255, 255, 255, 0.35);
		cursor: pointer;
		transition: background 0.2s, box-shadow 0.2s;
		-webkit-user-select: none;
		user-select: none;
	}

	.toggle-on {
		background: rgba(255, 255, 255, 0.25);
		box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.5);
	}

	.toggle-thumb {
		position: absolute;
		top: 2px;
		left: 2px;
		width: 16px;
		height: 16px;
		border-radius: 50%;
		background: #fff;
		transition: transform 0.2s;
	}

	.toggle-on .toggle-thumb {
		transform: translateX(14px);
	}
</style>
