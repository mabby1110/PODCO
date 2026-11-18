<script lang="ts">
	import { goto } from '$app/navigation';
	import type { Snippet } from 'svelte';

	let {
		titulo,
		contenido,
		meta,
		acciones,
		href = '/',
		style = '',
		ocultarAcciones,
		onclick
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
		<div class="meta-acciones">
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
		<div class="titulo">
			{#if titulo}
				{@render titulo()}
			{/if}
		</div>
		{#if meta}
			<div class="meta">
				{@render meta()}
			</div>
		{/if}
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
		cursor: pointer;
	}
	.item-lista {
		flex-grow: 1;
	}
	.meta-acciones {
		display: flex;
		flex-direction: column;
		gap: var(--a);
	}
	.titulo {
		display: flex;
		align-items: center;
		gap: var(--a);
	}
	.contenido {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: var(--a);
	}
	.contenido > :global(:last-child) {
		flex-grow: 1;
		text-align: end;
	}
</style>
