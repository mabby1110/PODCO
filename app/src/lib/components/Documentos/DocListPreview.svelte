<script lang="ts">
	import type { Snippet } from 'svelte';
	import { slide } from 'svelte/transition';

	let {
		header,
		resume,
		content,
		meta,
		href = '/',
		style = ''
	}: {
		header?: Snippet;
		resume?: Snippet;
		content?: Snippet;
		meta?: Snippet;
		href?: string;
		style?: string;
	} = $props();

	let show = $state(false);
	function handleNavigationClick(e: MouseEvent) {
		e.stopPropagation();
		window.location.href = href;
	}
	function handleClick() {
		show = !show;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			handleClick();
		}
	}
</script>

<div
	role="button"
	tabindex="0"
	onclick={handleClick}
	onkeydown={handleKeydown}
	{style}
	class="card-list-preview"
>
	{#if header}
		<div class="title">
			{@render header()}
		</div>
	{/if}

	{#if meta}
		<div class="meta" transition:slide>
			{@render meta()}
		</div>
	{/if}

	{#if content && show}
		<div class="content" transition:slide>
			{@render content()}
		</div>
	{/if}
</div>

<style>
	.card-list-preview {
        display: flex;
		flex-wrap: wrap;
		gap: var(--a);
		text-decoration: none;
		color: inherit;
		position: relative;
		padding: var(--a);
		background-color: var(--color-secondary);
		backdrop-filter: blur(16px);
		width: 100%;
        max-width: 800px;
		align-items: center;
		text-align: left;
		border-style: none;
		border-width: 0;
		border-radius: var(--a);
		cursor: pointer;
		white-space: pre-wrap;
	}

	.card-list-preview .title {
		flex-grow: 1;
	}
	.card-list-preview .content {
		display: flex;
		flex-direction: column;
		gap: var(--a);
		flex-grow: 1;
		width: 100%;
		overflow: hidden;
	}
	.meta {
		flex-grow: 2;
        display: flex;
        justify-content: space-between;
        flex-wrap: wrap;
	}
</style>
