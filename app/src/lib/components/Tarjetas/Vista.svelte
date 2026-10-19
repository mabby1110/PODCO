<script lang="ts">
	import type { Snippet } from 'svelte';
	import NavButton from '../Acciones/NavButton.svelte';

	let {
		portada,
		acciones,
		contenido,
		grid = false
	}: {
		portada?: Snippet;
		acciones: Snippet;
		contenido: Snippet;
		grid?: boolean;
	} = $props();
</script>

{#if portada}
	<div class="portada">
		{@render portada()}
	</div>
{/if}
<div class="vista" class:grid>
	{#if contenido}
		{@render contenido()}
	{/if}
</div>
<div class="controles">
	{#if acciones}
		{@render acciones()}
	{/if}
	<NavButton />
</div>

<style>
	.vista {
		position: relative;
		width: 100%;
		height: 100%;
		overflow: auto;
		display: flex;
		flex-direction: column;
		gap: var(--y);
		padding: var(--a);
		padding-bottom: var(--e);
	}
	.vista.grid {
		display: grid;
		grid-auto-flow: column;
		grid-template-rows: 20rem; /* una sola fila */
		grid-auto-columns: 16rem; /* ancho de cada ventana */
		align-content: start;
		gap: var(--b);

		overflow-x: auto;
		overflow-y: hidden;
		overscroll-behavior-x: contain;
		scroll-snap-type: x proximity;
		-webkit-overflow-scrolling: touch;
	}
	.vista.grid > :global(*) {
		min-width: 0;
		min-height: 0;
		height: 100%;
		overflow-y: auto;
		scroll-snap-align: start;
	}
	/* Cada elemento del grid es una ventana con scroll propio */
	.vista.grid > :global(*) {
		min-height: 0;
		min-width: 0;
		height: 100%;
		overflow: auto;
	}
	.controles {
		position: fixed;
		bottom: 0;
		right: 0;
		z-index: 88;
		padding: var(--a);

		display: flex;
		gap: var(--a);
		justify-content: flex-end;
		align-items: flex-end;
	}
</style>
