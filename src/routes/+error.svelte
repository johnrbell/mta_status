<script>
	import { page } from '$app/stores';
</script>

<div class="container">
	{#if $page.status === 404 && $page.error?.message}
		<p class="error-msg">Sorry, <em>{$page.error.message}</em> is not a valid NYC Subway line!</p>
	{:else}
		<p class="error-msg">Something went wrong.</p>
	{/if}
	<a href="/ez" class="error-link">back to all trains</a>
</div>

<style>
	.container {
		text-align: center;
	}

	.error-msg {
		font-size: 24px;
		font-weight: lighter;
		margin-top: 60px;
	}

	.error-msg em {
		font-style: italic;
		color: #ffcc00;
	}

	.error-link {
		display: inline-block;
		margin-top: 20px;
		font-size: 16px;
		color: rgba(255, 255, 255, 0.7);
		text-decoration: underline;
	}
</style>
