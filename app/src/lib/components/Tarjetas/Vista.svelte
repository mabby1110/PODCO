<script lang="ts">
	import type { Snippet } from 'svelte';
	import NavButton from '../Acciones/NavButton.svelte';
	import { arrowScroll } from '$lib/actions/keyboardScroll';

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
</script>

{#if portada}
	<div class="portada">
		{@render portada()}
	</div>
{/if}
<div class="vista" class:grid class:fullscreen use:arrowScroll={{ step: 40, enabled: true }}>
	{#if contenido}
		<div class="contenido">
			{@render contenido()}
		</div>
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
		padding: var(--a) var(--a) var(--e);
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
		bottom: 0;
		right: 0;
		z-index: 88;
		padding: var(--a);

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
		margin: auto;
		display: flex;
		flex-direction: column;
		gap: var(--a);
	}
</style>
