<script lang="ts">
	import type { Snippet } from 'svelte';
	import NavButton from '../Acciones/NavButton.svelte';

	let {
		portada,
		acciones,
		contenido
	}: { portada?: Snippet; acciones: Snippet; contenido: Snippet } = $props();
</script>

{#if portada}
	<div class="portada">
		{@render portada()}
	</div>
{/if}
<div class="vista">
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
		gap: var(--b);
		padding: var(--a);
		padding-bottom: var(--e);
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
