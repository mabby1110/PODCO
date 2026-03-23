<script lang="ts">
	import CardOpListPreview from '$lib/components/Oportunidad/CardOpListPreview.svelte';
	import Filtro from '$lib/components/Filtro.svelte';
	import { appState } from '$lib/stores/appState.svelte';
	import Leyenda from '../Leyenda.svelte';
	import Reload from '../Reload.svelte';
	import { columnasOportunidad } from '$lib';

	let { oportunidades } = $props();
	let filtrado = $derived([...oportunidades]);
</script>

<div class="view-container">
	<div class="controls">
		<button onclick={() => appState.toggleModalOp()} class="butter">+Oportunidad</button>
		<Reload />
		<Filtro items={oportunidades} columns={columnasOportunidad} bind:filteredItems={filtrado} />
	</div>
	<Leyenda />
	{#each filtrado as event (event.id)}
		<CardOpListPreview {event} />
	{/each}

	{#if filtrado.length === 0}
		<div class="no-results">
			<p>No se encontraron oportunidades con los filtros actuales.</p>
		</div>
	{/if}
</div>

<style>
	.no-results {
		text-align: center;
		padding: 2rem;
		color: #64748b;
	}
</style>
