<script>
	import { beforeNavigate, afterNavigate, invalidateAll } from '$app/navigation';
	import { setContext } from 'svelte';
	import { createBgStore } from '$lib/mode.js';
	import SubwayCanvas from '$lib/SubwayCanvas.svelte';

	let { children, data } = $props();

	const bgMode = createBgStore(data.bgMode);
	setContext('bgMode', bgMode);

	$effect(() => {
		document.documentElement.style.backgroundColor = '#000';
		document.body.style.backgroundColor = '#000';
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

{#if $bgMode === 1}
	<div class="bg" style="background-image: url({data.bgImg})"></div>
	<div class="screen"></div>
{:else if $bgMode === 2}
	<SubwayCanvas />
{/if}

<div class="signage-wrap">
	<a href="/" class="signage-header" onclick={handleLogoClick}>MTA Status</a>
	<div class="signage-subheader">Subway, at a glance.</div>
	{@render children()}
</div>

<div class="slider-wrap" role="radiogroup" aria-label="Background mode">
	{#each [0, 1, 2] as mode}
		<button
			class="slider-opt"
			class:slider-opt-active={$bgMode === mode}
			onclick={() => bgMode.setMode(mode)}
			aria-pressed={$bgMode === mode}
		>
			{#if mode === 0}
				<svg viewBox="0 0 16 16" fill="currentColor" width="14" height="14"><circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" stroke-width="1.5" /><line x1="4" y1="12" x2="12" y2="4" stroke="currentColor" stroke-width="1.5" /></svg>
			{:else if mode === 1}
				<svg viewBox="0 0 16 16" fill="currentColor" width="14" height="14"><rect x="2" y="3" width="12" height="10" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.5" /><circle cx="5.5" cy="6.5" r="1.5" /><path d="M2 11l3-3 2 2 3-4 4 5v.5A1.5 1.5 0 0112.5 13h-9A1.5 1.5 0 012 11.5z" opacity="0.5" /></svg>
			{:else}
				<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" width="14" height="14"><line x1="2" y1="8" x2="6" y2="4" /><line x1="6" y1="4" x2="6" y2="12" /><line x1="6" y1="12" x2="10" y2="8" /><line x1="10" y1="8" x2="14" y2="8" /></svg>
			{/if}
		</button>
	{/each}
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
		margin: 0 auto;
	}

	@media (display-mode: standalone) {
		.signage-wrap {
			padding-top: calc(28px + env(safe-area-inset-top));
		}
	}

	.signage-header {
		display: block;
		font-size: clamp(42px, 10vw, 64px);
		font-weight: 700;
		letter-spacing: 0.01em;
		margin-bottom: 4px;
		line-height: 1.1;
		text-decoration: none;
		color: #fff;
		cursor: pointer;
	}

	.signage-subheader {
		font-size: clamp(24px, 5.5vw, 36px);
		font-weight: 400;
		margin-bottom: 28px;
		line-height: 1.2;
	}

	@media (min-width: 890px) {
		.signage-wrap {
			padding: 40px 48px;
			max-width: 700px;
		}
	}

	/* 3-way slider */
	.slider-wrap {
		position: fixed;
		bottom: 10px;
		right: 16px;
		z-index: 100000;
		display: flex;
		gap: 2px;
		background: rgba(255, 255, 255, 0.12);
		border-radius: 10px;
		padding: 3px;
		-webkit-user-select: none;
		user-select: none;
	}

	.slider-opt {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 22px;
		border: none;
		border-radius: 7px;
		background: transparent;
		color: rgba(255, 255, 255, 0.4);
		cursor: pointer;
		padding: 0;
		transition: background 0.2s, color 0.2s;
	}

	.slider-opt-active {
		background: rgba(255, 255, 255, 0.25);
		color: #fff;
	}
</style>
