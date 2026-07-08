<script lang="ts">
	import type { Snippet } from 'svelte';
	import { slide } from 'svelte/transition';

	let {
		header,
		resume,
		content,
		meta,
		acciones,
		href = '/',
		style = '',
		ocultarAcciones
	}: {
		header?: Snippet;
		resume?: Snippet;
		content?: Snippet;
		meta?: Snippet;
		acciones?: Snippet;
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

<div
	role="button"
	tabindex="0"
	onclick={handleClick}
	onkeydown={handleKeydown}
	{style}
	class="list-card-preview"
>
	<div class="list-card-header">
		{#if header}
			{@render header()}
		{/if}
		{#if resume}
			<div class="resume">
				{@render resume()}
			</div>
		{/if}
	</div>

	{#if content && show}
		<div class="list-card-content" transition:slide>
			{@render content()}
		</div>
	{/if}

	{#if meta}
		<div class="list-card-meta">
			{@render meta()}
		</div>
	{/if}
	<div class="list-card-actions">
		{#if !ocultarAcciones}
			<button class="butter" onclick={handleNavigationClick}>Ver</button>
		{/if}
		{#if acciones}
			{@render acciones()}
		{/if}
	</div>
</div>

<style>
	.list-card-preview {
		position: relative;
		min-height: var(--e);
		padding: var(--a);

		background-color: var(--color-secondary);
		backdrop-filter: blur(16px);
		border-style: none;
		border-width: 0;
		border-radius: var(--a);
		cursor: pointer;
		white-space: pre-wrap;

		display: grid;
		grid-template-columns: 6fr 1fr;
	}

	.list-card-header {
		display: flex;
		flex-direction: column;
	}
	.list-card-header .resume {
		flex-wrap: wrap;
		font-size: smaller;
		padding: var(--a);
		max-height: 30vh;
		overflow: hidden;
		pointer-events: none;
	}
	.list-card-content {
		padding: var(--b) var(--a);
		display: flex;
		flex-direction: column;
		gap: var(--a);
		pointer-events: none;
	}
	.list-card-meta {
		grid-column: 1 / end;
		grid-row: 3;
		display: flex;
		gap: 0 var(--a);
		flex-wrap: wrap;
		font-size: smaller;
	}
	.list-card-actions {
		grid-row: 1 / span 2;
		grid-column: 2 / end;
		display: flex;
		justify-content: flex-end;
	}
	.list-card-actions button {
		height: fit-content;
	}
</style>
