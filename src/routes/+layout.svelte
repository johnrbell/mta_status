<script>
	import { beforeNavigate, afterNavigate } from '$app/navigation';
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

	setContext('loader', { showLoader, hideLoader });

	beforeNavigate(() => showLoader());
	afterNavigate(() => hideLoader());
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
	<div class="vignette"></div>
{:else if $bgMode === 2}
	<SubwayCanvas />
	<div class="screen canvas-screen"></div>
{/if}

<div class="content-layer">
	{@render children()}
</div>

<footer class="site-footer">
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
</footer>

<style>
	:global(html), :global(body) {
		margin: 0;
		padding: 0;
		font-family: 'Helvetica Neue', Arial, sans-serif;
		color: white;
		-webkit-tap-highlight-color: transparent;
		-webkit-touch-callout: none;
		-webkit-user-select: none;
		user-select: none;
		overscroll-behavior: none;
	}

	:global(a) {
		color: white;
	}

	.screen {
		inset: 0;
		background-color: #222;
		opacity: 0.8;
		position: fixed;
		z-index: 1;
	}

	.canvas-screen {
		background-color: #000;
		opacity: 0.2;
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

	.vignette {
		position: fixed;
		inset: 0;
		z-index: 1;
		pointer-events: none;
		background:
			linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 30%),
			linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 30%);
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

	.content-layer {
		position: relative;
		z-index: 2;
		min-height: 100vh;
	}

	.site-footer {
		position: relative;
		z-index: 3;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
		padding: 24px 0 16px;
		font-size: 11px;
		color: rgba(255, 255, 255, 0.2);
		font-family: 'Helvetica Neue', Arial, sans-serif;
	}

	.slider-wrap {
		display: flex;
		gap: 2px;
		background: rgba(255, 255, 255, 0.08);
		border-radius: 10px;
		padding: 3px;
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
		color: rgba(255, 255, 255, 0.25);
		cursor: pointer;
		padding: 0;
		transition: background 0.2s, color 0.2s;
	}

	.slider-opt-active {
		background: rgba(255, 255, 255, 0.2);
		color: rgba(255, 255, 255, 0.6);
	}
</style>
