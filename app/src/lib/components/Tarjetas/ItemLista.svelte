<script lang="ts">
	import { goto } from '$app/navigation';
	import type { Snippet } from 'svelte';
	import { slide } from 'svelte/transition';

	let {
		titulo,
		contenido,
		meta,
		acciones,
		href = '/',
		style = '',
		ocultarAcciones,
		onclick // <-- Nuevo prop añadido
	}: {
		titulo: Snippet;
		contenido?: Snippet;
		meta?: Snippet;
		acciones?: Snippet;
		href?: string;
		style?: string;
		ocultarAcciones?: boolean;
		onclick?: (e: MouseEvent | KeyboardEvent) => void;
	} = $props();

	let show = $state(false);

	function handleNavigationClick(e: MouseEvent) {
		e.stopPropagation();
		goto(href);
	}

	// Actualizamos la función para recibir el evento
	function handleClick(e: MouseEvent | KeyboardEvent) {
		const manejado = onclick?.(e);
		if (manejado === false || !onclick) {
			show = !show;
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			handleClick(e);
		}
	}
</script>

<div class="contenedor-item">
	{#if acciones}
		<div class="acciones">
			{@render acciones()}
		</div>
	{/if}
	<div
		role="button"
		tabindex="0"
		onclick={handleClick}
		onkeydown={handleKeydown}
		{style}
		class="item-lista"
	>
		{#if meta}
			<div class="meta">
				{@render meta()}
			</div>
		{/if}
		<div class="titulo">
			{#if titulo}
				{@render titulo()}
			{/if}
		</div>
		<div class="contenido">
			{#if contenido}
				{@render contenido()}
			{/if}
		</div>
	</div>
</div>

<style>
	.contenedor-item {
		display: flex;
		gap: var(--a);
	}
	.item-lista {
		flex-grow: 1;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(var(--h), 1fr));
	}
	.meta {
		grid-column: span 3;
		font-size: var(--b);
		padding: var(--y) 0;
	}
	.titulo {
		grid-column: span 2;
	}
	.contenido {
		grid-column: -3 / -1;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(var(--g), 1fr));
		justify-items: flex-end;
	}
</style>
