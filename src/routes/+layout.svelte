<script>
	import { beforeNavigate, afterNavigate, invalidateAll } from '$app/navigation';

	let { children, data } = $props();
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

<style>
	:global(html), :global(body) {
		margin: 0;
		padding: 0;
		font-family: 'Helvetica Neue', Arial, sans-serif;
		color: white;
		-webkit-user-select: none;
		user-select: none;
		-webkit-tap-highlight-color: transparent;
		-webkit-touch-callout: none;
		overscroll-behavior: none;
		overflow: auto;
		-webkit-overflow-scrolling: touch;
	}

	:global(a) {
		color: white;
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
</style>
