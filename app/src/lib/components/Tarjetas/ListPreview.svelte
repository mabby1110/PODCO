<script lang="ts">
	import { goto } from '$app/navigation';
	import type { Snippet } from 'svelte';

	let {
		titulo,
		contenido,
		metaDatos,
		acciones,
		style = ''
	}: {
		titulo: Snippet;
		contenido: Snippet;
		metaDatos?: Snippet;
		acciones?: Snippet;
		style?: string;
	} = $props();

	let show = $state(false);
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
	class="jelly tarjeta-preview"
>
	<div class="titulo" class:show>
		{#if titulo}
			{@render titulo()}
		{/if}
	</div>
	<div class="contenido" class:show>
		{#if contenido}
			{@render contenido()}
		{/if}
	</div>
	{#if acciones && show}
		<div class="acciones">
			{@render acciones()}
		</div>
	{/if}
	<div class="meta-datos">
		{#if metaDatos}
			{@render metaDatos()}
		{/if}
	</div>
</div>

<style>
	.tarjeta-preview {
		position: relative;
		width: 100%;
		display: grid;
		grid-template-columns: 3fr 5fr;
		padding: var(--a);
	}
	.titulo {
		margin-top: var(--a);
	}
	.contenido {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(var(--g), 1fr));
		max-height: var(--f);
		overflow: hidden;
	}
	.acciones {
		grid-column: -1 / -2;
		display: flex;
		justify-content: flex-end;
	}
	.show {
		padding: var(--a);
		grid-column: span 2;
		max-height: 70vh;
	}
	.meta-datos {
		position: absolute;
		top: 0;
		left: var(--a);
		font-size: smaller;
		width: 100%;
		display: flex;
		gap: var(--a);
	}
</style>
