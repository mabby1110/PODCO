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

	{#if resume}
		<div class="content {show?'':'resume'}" transition:slide>
			{@render resume()}
		</div>
	{/if}

	{#if content && show}
		<div class="content" transition:slide>
			{@render content()}
		</div>
	{/if}

	<div class="acciones">
		{#if meta}
			<div class="meta">
				{@render meta()}
			</div>
		{/if}
		<button class="butter" onclick={handleNavigationClick}>Ver</button>
	</div>
</div>

<style>
	.card-list-preview {
		text-decoration: none;
		color: inherit;
		position: relative;
		padding: var(--a);
		background-color: var(--color-secondary);
		backdrop-filter: blur(16px);
		width: 100%;
		min-height: var(--e);
		display: flex;
		flex-wrap: wrap;
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
		min-width: var(--g);
		display: flex;
		gap: var(--a);
		align-items: last baseline;
		flex-wrap: wrap;
	}

	.acciones {
		width: 100%;
		display: flex;
		gap: var(--a);
		justify-content: space-between;
		align-items: flex-end;
	}
	.acciones button {
		height: fit-content;
		flex-grow: 1;
		min-width: var(--e);
		max-width: var(--f);
	}
	.card-list-preview .content {
		flex-grow: 1;
		width: 100%;
		overflow: hidden;
		pointer-events: none;
	}
	.card-list-preview .meta {
		display: flex;
		gap: 0 var(--a);
		flex-wrap: wrap;
		font-size: smaller;
	}
	.resume {
		max-height: 180px;
	}
</style>
