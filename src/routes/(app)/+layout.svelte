<script>
	import { getContext } from 'svelte';
	import { invalidateAll } from '$app/navigation';

	let { children } = $props();

	const { showLoader, hideLoader } = getContext('loader');

	async function handleLogoClick(e) {
		e.preventDefault();
		showLoader();
		await invalidateAll();
		hideLoader();
	}
</script>

<div class="signage-wrap">
	<a href="/" class="signage-header" onclick={handleLogoClick}>MTA Status</a>
	<div class="signage-subheader">Subway, at a glance.</div>
	{@render children()}
</div>

<style>
	.signage-wrap {
		font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
		color: #fff;
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
		font-size: clamp(42px, 15vw, 64px);
		font-weight: 700;
		letter-spacing: 0.01em;
		margin-bottom: 4px;
		line-height: 1.1;
		text-decoration: none;
		color: #fff;
		cursor: pointer;
	}

	.signage-subheader {
		font-size: clamp(24px, 8.5vw, 36px);
		font-weight: 400;
		margin-bottom: 28px;
		line-height: 1.2;
	}

	@media (max-width: 767px) {
		.signage-wrap {
			padding: 28px 16px;
		}
	}

	@media (max-width: 767px) and (display-mode: standalone) {
		.signage-wrap {
			padding-top: calc(28px + env(safe-area-inset-top));
		}
	}

	@media (min-width: 890px) {
		.signage-wrap {
			padding: 40px 48px;
			max-width: 700px;
		}
	}
</style>
