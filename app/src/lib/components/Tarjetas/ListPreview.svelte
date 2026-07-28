<script lang="ts">
	import { goto } from '$app/navigation';
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
		goto(href);
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
	class="list-card-preview panel"
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

	<div class="list-card-meta">
		{#if meta}
			<div class="data">
				{@render meta()}
			</div>
		{/if}
		<div class="actions">
			{#if !ocultarAcciones}
				<button class="butter" onclick={handleNavigationClick}>Ver</button>
			{/if}
			{#if acciones}
				{@render acciones()}
			{/if}
		</div>
	</div>
</div>

<style>
	.list-card-preview {
		display: flex;
		flex-wrap: wrap;
		padding: 4px;
		cursor: pointer;
	}
	.list-card-header {
		flex-grow: 3;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(var(--e), 1fr));
		gap: 0 var(--a);
	}
	:global(.list-card-header > *:nth-child(1)) {
		grid-column: span 5;
	}
	:global(.list-card-header > *:nth-child(2)) {
		grid-column: span 2;
	}
	.list-card-content {
		width: 100%;
		padding: var(--b) 0;
	}
	.list-card-meta {
		width: 100%;
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 0 var(--a);
	}
	.list-card-meta .data {
		font-size: smaller;
		display: flex;
		flex-wrap: wrap;
		gap: 0 var(--a);
	}
	.list-card-meta .actions {
		font-size: smaller;
		display: flex;
		gap: var(--a);
		flex-direction: row-reverse;
		flex-wrap: wrap-reverse;
		align-items: baseline;
		z-index: 1;
	}
</style>
