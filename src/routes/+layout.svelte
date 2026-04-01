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
		<img src="/img/icons/apple-icon-180x180.png" alt="Loading" class="loader-icon" />
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

	.loader-icon {
		width: 80px;
		height: 80px;
		border-radius: 50%;
		animation: spin 0.8s ease-in-out infinite;
	}

	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
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
