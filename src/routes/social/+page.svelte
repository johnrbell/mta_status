<script>
	import { lineColors } from '$lib/colors.js';
	import { trainNames } from '$lib/personas.js';

	let { data } = $props();

	function timeAgo(dateStr) {
		const now = Date.now();
		const then = new Date(dateStr).getTime();
		const seconds = Math.floor((now - then) / 1000);
		if (seconds < 60) return 'just now';
		const minutes = Math.floor(seconds / 60);
		if (minutes < 60) return `${minutes}m ago`;
		const hours = Math.floor(minutes / 60);
		if (hours < 24) return `${hours}h ago`;
		const days = Math.floor(hours / 24);
		return `${days}d ago`;
	}
</script>

<svelte:head>
	<title>MTA Social</title>
</svelte:head>

<div class="feed">
	<div class="feed-header">
		<div class="feed-title">MTA Social</div>
		<div class="feed-subtitle">What the trains are saying</div>
	</div>

	{#if data.posts.length === 0}
		<div class="empty">No posts yet. The trains are being uncharacteristically quiet.</div>
	{:else}
		{#each data.posts as post}
			<div class="post">
				<div class="post-avatar" style="background-color: {lineColors[post.line] || '#888'}">
					{post.line}
				</div>
				<div class="post-body">
					<div class="post-meta">
						<span class="post-name">{trainNames[post.line] || post.line}</span>
						<span class="post-status">· {post.status_context}</span>
						<span class="post-time">· {timeAgo(post.created_at)}</span>
					</div>
					<div class="post-content">{post.content}</div>
				</div>
			</div>
		{/each}
	{/if}
</div>

<style>
	.feed {
		margin: 0 auto;
		padding: 28px 24px;
		box-sizing: border-box;
		font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
		color: #fff;
		min-height: 100vh;
	}

	@media (display-mode: standalone) {
		.feed {
			padding-top: calc(28px + env(safe-area-inset-top));
		}
	}

	@media (max-width: 767px) {
		.feed {
			padding: 28px 16px;
		}
	}

	@media (max-width: 767px) and (display-mode: standalone) {
		.feed {
			padding-top: calc(28px + env(safe-area-inset-top));
		}
	}

	.feed-header {
		margin-bottom: 28px;
	}

	.feed-title {
		font-size: clamp(42px, 15vw, 64px);
		font-weight: 700;
		letter-spacing: 0.01em;
		margin-bottom: 4px;
		line-height: 1.1;
	}

	.feed-subtitle {
		font-size: clamp(24px, 8.5vw, 36px);
		font-weight: 400;
		line-height: 1.2;
	}

	.empty {
		text-align: center;
		color: rgba(255, 255, 255, 0.4);
		font-size: 16px;
		padding: 60px 20px;
	}

	.post {
		display: flex;
		gap: 12px;
		padding: 16px 0;
		border-bottom: 1px solid rgba(255, 255, 255, 0.08);
	}

	.post-avatar {
		flex-shrink: 0;
		width: 44px;
		height: 44px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 22px;
		font-weight: 700;
		color: #fff;
		line-height: 1;
	}

	.post-body {
		flex: 1;
		min-width: 0;
	}

	.post-meta {
		display: flex;
		align-items: baseline;
		gap: 4px;
		flex-wrap: wrap;
		margin-bottom: 4px;
	}

	.post-name {
		font-weight: 700;
		font-size: 15px;
	}

	.post-status {
		font-size: 13px;
		color: rgba(255, 255, 255, 0.4);
	}

	.post-time {
		font-size: 13px;
		color: rgba(255, 255, 255, 0.35);
	}

	.post-content {
		font-size: 15px;
		line-height: 1.45;
		color: rgba(255, 255, 255, 0.9);
		word-break: break-word;
	}

	@media (min-width: 890px) {
		.feed {
			padding: 40px 48px;
			max-width: 700px;
		}

		.post-avatar {
			width: 52px;
			height: 52px;
			font-size: 26px;
		}

		.post-content {
			font-size: 16px;
		}
	}
</style>
