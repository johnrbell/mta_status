<script>
	import { lineColors } from '$lib/colors.js';
	import { trainNames } from '$lib/personas.js';

	let { data } = $props();

	let expanded = $state({});
	let activeStory = $state(null);

	const lineOrder = ['1','2','3','4','5','6','7','A','C','E','B','D','F','M','G','J','Z','L','N','Q','R','W','S'];

	let stories = $derived.by(() => {
		const seen = new Map();
		for (const post of data.posts) {
			if (!seen.has(post.line)) {
				seen.set(post.line, post);
			}
		}
		return [...seen.entries()]
			.map(([line, post]) => ({ line, post }))
			.sort((a, b) => {
				const ai = lineOrder.indexOf(a.line);
				const bi = lineOrder.indexOf(b.line);
				return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
			});
	});

	function toggleDetails(id) {
		expanded = { ...expanded, [id]: !expanded[id] };
	}

	function openStory(line) {
		activeStory = line;
	}

	function closeStory() {
		activeStory = null;
	}

	function handleBackdropClick(e) {
		if (e.target === e.currentTarget) closeStory();
	}

	function handleKeydown(e) {
		if (e.key === 'Escape') closeStory();
	}

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

	{#if stories.length > 0}
		<div class="stories-bar">
			{#each stories as { line }}
				<button class="story-item" onclick={() => openStory(line)}>
					<div class="story-avatar" style="background-color: {lineColors[line] || '#888'}">
						{line}
					</div>
				</button>
			{/each}
		</div>
	{/if}

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
					{#if post.alert_details}
						<button class="read-more" onclick={() => toggleDetails(post.id)}>
							{expanded[post.id] ? 'hide details' : 'read more'}
						</button>
						{#if expanded[post.id]}
							<div class="post-details">{post.alert_details}</div>
						{/if}
					{/if}
				</div>
			</div>
		{/each}
	{/if}
</div>

{#if activeStory}
	{@const storyPost = stories.find((s) => s.line === activeStory)?.post}
	{#if storyPost}
		<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
		<div class="modal-backdrop" role="dialog" aria-modal="true" onclick={handleBackdropClick} onkeydown={handleKeydown}>
			<div class="modal-card">
				<button class="modal-close" onclick={closeStory} aria-label="Close">&times;</button>
				<div class="modal-header">
					<div class="modal-avatar" style="background-color: {lineColors[activeStory] || '#888'}">
						{activeStory}
					</div>
					<div class="modal-meta">
						<span class="modal-name">{trainNames[activeStory] || activeStory}</span>
						<span class="modal-time">{timeAgo(storyPost.created_at)}</span>
					</div>
				</div>
				<div class="modal-status">{storyPost.status_context}</div>
				<div class="modal-content">{storyPost.content}</div>
				{#if storyPost.alert_details}
					<div class="modal-details">{storyPost.alert_details}</div>
				{/if}
			</div>
		</div>
	{/if}
{/if}

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
		font-size: clamp(16px, 4vw, 24px);
		font-weight: 400;
		line-height: 1.2;
		white-space: nowrap;
	}

	.stories-bar {
		display: flex;
		gap: 8px;
		overflow-x: auto;
		padding: 4px 0 16px;
		margin-bottom: 8px;
		border-bottom: 1px solid rgba(255, 255, 255, 0.08);
		scrollbar-width: none;
		-ms-overflow-style: none;
	}

	.stories-bar::-webkit-scrollbar {
		display: none;
	}

	.story-item {
		background: none;
		border: none;
		cursor: pointer;
		padding: 0;
		flex-shrink: 0;
		-webkit-tap-highlight-color: transparent;
	}

	.story-avatar {
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

	.story-item:active .story-avatar {
		transform: scale(0.93);
	}

	.modal-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.75);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: 20px;
	}

	.modal-card {
		background: #1a1a1a;
		border-radius: 16px;
		padding: 28px 24px;
		max-width: 440px;
		width: 100%;
		position: relative;
		border: 1px solid rgba(255, 255, 255, 0.1);
		animation: modalIn 0.2s ease-out;
	}

	@keyframes modalIn {
		from {
			opacity: 0;
			transform: scale(0.92);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}

	.modal-close {
		position: absolute;
		top: 12px;
		right: 16px;
		background: none;
		border: none;
		color: rgba(255, 255, 255, 0.5);
		font-size: 28px;
		cursor: pointer;
		line-height: 1;
		padding: 4px;
	}

	.modal-close:hover {
		color: #fff;
	}

	.modal-header {
		display: flex;
		align-items: center;
		gap: 12px;
		margin-bottom: 16px;
	}

	.modal-avatar {
		width: 48px;
		height: 48px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 24px;
		font-weight: 700;
		color: #fff;
		line-height: 1;
		flex-shrink: 0;
	}

	.modal-meta {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.modal-name {
		font-weight: 700;
		font-size: 16px;
		color: #fff;
	}

	.modal-time {
		font-size: 13px;
		color: rgba(255, 255, 255, 0.35);
	}

	.modal-status {
		font-size: 13px;
		color: rgba(255, 255, 255, 0.45);
		margin-bottom: 12px;
		text-transform: lowercase;
	}

	.modal-content {
		font-size: 16px;
		line-height: 1.5;
		color: rgba(255, 255, 255, 0.9);
		word-break: break-word;
	}

	.modal-details {
		font-size: 13px;
		line-height: 1.5;
		color: rgba(255, 255, 255, 0.4);
		margin-top: 14px;
		padding-top: 14px;
		border-top: 1px solid rgba(255, 255, 255, 0.08);
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

	.read-more {
		background: none;
		border: none;
		color: rgba(255, 255, 255, 0.35);
		font-size: 13px;
		padding: 4px 0 0 0;
		cursor: pointer;
		font-family: inherit;
	}

	.read-more:hover {
		color: rgba(255, 255, 255, 0.6);
	}

	.post-details {
		font-size: 13px;
		line-height: 1.5;
		color: rgba(255, 255, 255, 0.5);
		margin-top: 6px;
		padding: 8px 0;
		border-top: 1px solid rgba(255, 255, 255, 0.06);
	}

	@media (min-width: 890px) {
		.feed {
			padding: 40px 48px;
			max-width: 700px;
		}

		.story-avatar {
			width: 52px;
			height: 52px;
			font-size: 26px;
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
