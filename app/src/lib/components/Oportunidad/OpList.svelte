<script lang="ts">
	import CardOpListPreview from '$lib/components/Oportunidad/CardOpListPreview.svelte';
	import Filtro from '$lib/components/Filtro.svelte';
	import { appState } from '$lib/stores/appState.svelte';
	import Leyenda from '../Leyenda.svelte';
	import Reload from '../Reload.svelte';
	import { agrupacionesOportunidades, columnasOportunidad } from '$lib';
	import { agruparPor } from '$lib/utils/util'; // <-- Importamos la función
	import FilterOpList from '../FilterOpList.svelte';
	import Select from '../Select.svelte';
	import Grupo from '../Grupo.svelte';
	import { selectedGroupStore } from '$lib/stores/groupFilter.svelte';

	let { oportunidades } = $props();

	let filtrado = $derived([...oportunidades]);
	let selected = $state(selectedGroupStore.selectedGroup ?? '');
	$effect(() => {
		console.log(selected);
		selectedGroupStore.selectedGroup = selected != '' ? selected : '';
	});
	let listaAgrupada = $derived(agruparPor(filtrado, selected));

</script>

<div class="view-container">
	<div class="controls">
		<Reload />
		<button onclick={() => appState.toggleModalOp()} class="butter">+Oportunidad</button>
		<FilterOpList />
		<Select options={agrupacionesOportunidades} defaultOption="Agrupar todos" bind:selected />
		<Filtro items={oportunidades} columns={columnasOportunidad} bind:filteredItems={filtrado} />
	</div>
	<Leyenda />

	{#each listaAgrupada as agrupacion (agrupacion.grupo)}
		<div class="grupo-dia">
			<Grupo {agrupacion} showByDefault>
				{#each agrupacion.elementos as event (event.id)}
					<CardOpListPreview {event} />
				{/each}
			</Grupo>
		</div>
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

	.grupo-dia {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin-bottom: 1.5rem;
	}

	.dia-header {
		margin: 0;
		padding-bottom: 0.5rem;
		border-bottom: 2px solid var(--color-muted, #e2e8f0);
		color: var(--color-text, #333);
		font-size: 1.1rem;
	}

	.lista-eventos {
		display: flex;
		flex-direction: column;
		gap: 0.5rem; /* Ajusta según el espaciado que necesites entre tarjetas */
	}
</style>
