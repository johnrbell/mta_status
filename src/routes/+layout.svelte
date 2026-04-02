<script>
	import { beforeNavigate, afterNavigate, invalidateAll } from '$app/navigation';
	import { setContext } from 'svelte';
	import { createBgStore } from '$lib/mode.js';

	let { children, data } = $props();

	const bgVisible = createBgStore(data.bgVisible);
	setContext('bgVisible', bgVisible);

	$effect(() => {
		if ($bgVisible) {
			document.documentElement.style.backgroundColor = '';
			document.body.style.backgroundColor = '';
		} else {
			document.documentElement.style.backgroundColor = '#000';
			document.body.style.backgroundColor = '#000';
		}
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

{#if loading}
	<div class="signage-loader-overlay">
		<svg class="signage-spinner" viewBox="0 0 50 50">
			<circle cx="25" cy="25" r="20" />
		</svg>
	</div>
{/if}

{#if $bgVisible}
	<div class="bg" style="background-image: url({data.bgImg})"></div>
	<div class="screen"></div>
{/if}

<div class="signage-wrap">
	<a href="/" class="signage-header" onclick={handleLogoClick}>Mta Status</a>
	<div class="signage-subheader">Subway, at a glance.</div>
	{@render children()}
</div>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<div
	class="toggle"
	class:toggle-on={$bgVisible}
	onclick={bgVisible.toggle}
	role="switch"
	aria-checked={$bgVisible}
	tabindex="0"
	onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); bgVisible.toggle(); } }}
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

	.screen {
		inset: 0;
		background-color: #222;
		opacity: 0.7;
		position: fixed;
		z-index: 1;
	}

	.bg {
		inset: 0;
		background-color: #333;
		background-size: cover;
		background-position: center center;
		background-repeat: no-repeat;
		z-index: 0;
		position: fixed;
		text-align: center;
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

	/* Signage layout */
	.signage-wrap {
		position: relative;
		z-index: 2;
		font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
		color: #fff;
		min-height: 100vh;
		padding: 28px 24px;
		box-sizing: border-box;
		width: 75vw;
		max-width: 600px;
		margin: 0 auto;
	}

	@media (display-mode: standalone) {
		.signage-wrap {
			padding-top: calc(28px + env(safe-area-inset-top));
		}
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
		.signage-wrap {
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
