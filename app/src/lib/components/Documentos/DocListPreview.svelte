<script lang="ts">
	import type { Snippet } from 'svelte';
	import { slide } from 'svelte/transition';

	let {
		header,
		acciones,
		content,
		meta,
		href = '/',
		style = '',
		ocultarAcciones
	}: {
		header?: Snippet;
		acciones?: Snippet;
		content?: Snippet;
		meta?: Snippet;
		href?: string;
		style?: string;
		ocultarAcciones?: boolean;
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

<div class="preview">
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

		{#if content && show}
			<div class="content" transition:slide>
				{@render content()}
			</div>
		{/if}

		{#if meta}
			<div class="meta" transition:slide>
				{@render meta()}
			</div>
		{/if}
	</div>
	<div class="acciones">
		{#if acciones}
			{@render acciones()}
		{/if}
		{#if !ocultarAcciones}
			<button class="butter" onclick={handleNavigationClick}>Ver</button>
		{/if}
	</div>
</div>

<style>
	.preview {
		display: flex;
		flex-wrap: wrap;
		gap: var(--a);
	}
	.card-list-preview {
		position: relative;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: var(--a);
		padding: var(--a);
		background-color: var(--color-secondary);
		backdrop-filter: blur(16px);
		width: 100%;
		max-width: 800px;
		text-align: left;
		border-style: none;
		border-width: 0;
		border-radius: var(--a);
		cursor: pointer;
		white-space: pre-wrap;
	}
	.card-list-preview .title {
		grid-column: span 3;
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
		grid-column: span 2;
		display: flex;
		justify-content: space-between;
		flex-wrap: wrap;
	}
</style>
