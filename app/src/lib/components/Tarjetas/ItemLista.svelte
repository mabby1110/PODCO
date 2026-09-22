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
		titulo?: Snippet;
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
		if (onclick) {
			onclick(e);
		} else {
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

<div
	role="button"
	tabindex="0"
	onclick={handleClick}
	onkeydown={handleKeydown}
	{style}
	class="item tarjeta"
>
	<div class="principal">
		{#if titulo}
			{@render titulo()}
		{/if}
		{#if acciones}
			<div class="acciones">
				{@render acciones()}
			</div>
		{/if}
	</div>
	{#if contenido && show}
		<div class="contenido" transition:slide>
			{@render contenido()}
		</div>
	{/if}
	{#if meta}
		<div class="meta">
			{@render meta()}
		</div>
	{/if}
</div>

<style>
	/* ...Tus estilos se mantienen intactos... */
	.item {
		display: flex;
		flex-direction: column;
		cursor: pointer;
		padding: var(--a) var(--a) 0;
	}
	.principal {
		width: 100%;
		display: grid;
		grid-template-columns: 3fr auto;
		align-items: baseline;
	}
	.titulo {
		flex-grow: 1;
	}
	.acciones {
		display: flex;
		flex-wrap: wrap;
		justify-content: flex-end;
		flex-wrap: wrap;
	}
	.contenido {
		width: 100%;
	}
	.meta {
		font-size: small;
		font-weight: lighter;
		width: 100%;
	}
</style>