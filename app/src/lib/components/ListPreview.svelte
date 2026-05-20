<script lang="ts">
	import type { Snippet } from 'svelte';
	import { slide } from 'svelte/transition';

	let {
		header,
		content,
		meta,
		href = '/',
		style = ''
	}: {
		header?: Snippet;
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

	// Importante para la accesibilidad y navegación por teclado
	function handleKeydown(e: KeyboardEvent) {
		// Ejecuta el clic si se presiona Enter o la barra Espaciadora
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault(); // Evita que la barra espaciadora haga un salto en la página
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

	{#if content && show}
		<div class="brief" transition:slide>
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
		gap: var(--a);
		flex-wrap: wrap;
		align-items: center;
		text-align: left;
		border-style: none;
		border-width: 0;
		border-radius: var(--a);
		cursor: pointer;
	}

	.card-list-preview .title {
		min-width: 60%;
	}

	.acciones {
		display: flex;
		gap: var(--a);
	}
	.card-list-preview .brief {
		display: flex;
		flex-wrap: wrap;
		gap: var(--a);
		flex-grow: 1;
		width: 100%;
		overflow: hidden;
		pointer-events: none;
	}

	.card-list-preview .meta {
		display: flex;
		flex-wrap: wrap;
		font-size: smaller;
	}
	.card-list-preview .meta .id {
		width: 100%;
	}
</style>
