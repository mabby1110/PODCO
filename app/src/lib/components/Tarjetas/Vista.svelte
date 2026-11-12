<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import NavButton from '../Acciones/NavButton.svelte';
	import { arrowScroll } from '$lib/actions/keyboardScroll';
	import { appState } from '$lib/stores/appState.svelte';
	import { StoreAplicacion } from '$lib/stores/app/StoreAplicacion.svelte';

	let {
		portada,
		acciones,
		contenido,
		grid = false,
		fullscreen = false
	}: {
		portada?: Snippet;
		acciones: Snippet;
		contenido: Snippet;
		grid?: boolean;
		fullscreen?: boolean;
	} = $props();

	let mounted = $state(false);

	onMount(() => {
		mounted = true;
	});
</script>

{#if portada}
	<div class="portada">
		{@render portada()}
	</div>
{/if}
<div
	class="vista"
	class:grid
	class:fullscreen={!StoreAplicacion.value.controles}
	use:arrowScroll={{ step: 40, enabled: true }}
>
	{#if contenido && mounted}
		<div class="contenido">
			{@render contenido()}
		</div>
	{:else}
		<div class="animate-pulse">Cargando vista...</div>
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
		padding: var(--a) var(--a) var(--e); /* 1. Añadimos duración y un easing suave (cubic-bezier) */
		transition:
			padding 0.35s cubic-bezier(0.4, 0, 0.2, 1),
			max-width 0.35s cubic-bezier(0.4, 0, 0.2, 1);
	}
	.vista.grid {
		display: grid;
		grid-auto-flow: column;
		grid-template-rows: 20rem;
		grid-auto-columns: 16rem;
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
	.controles {
		position: fixed;
		bottom: var(--c);
		right: var(--c);
		z-index: 88;

		display: flex;
		gap: var(--a);
		justify-content: flex-end;
		align-items: flex-end;
	}
	.vista.fullscreen > :global(*) {
		max-width: 100%;
	}
	.vista.fullscreen {
		max-width: 100%;
		padding: 0;
	}
	.contenido {
		width: 100%;
		height: 100%;
		max-width: var(--k);
		display: flex;
		flex-direction: column;
		gap: var(--a);
	}
</style>
