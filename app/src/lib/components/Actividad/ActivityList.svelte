<script lang="ts">
	import CardActividadListPreview from '$lib/components/Actividad/CardActividadListPreview.svelte';
	import { appState } from '$lib/stores/appState.svelte';
	import Leyenda from '../Leyenda.svelte';
	import Reload from '../Reload.svelte';
	import Filtro from '../Filtro.svelte';
	import FilterOpList from '../FilterOpList.svelte';

	let { actividades } = $props();

	let filtrado = $derived([...actividades]);
	let steps = [
		{ label: 'Programada', color: 'var(--color-secondary)' },
		{ label: 'Finalizada', color: '#000000ee' }
	];
	const configuracionColumnas = [
		{ key: 'motivo', label: 'Motivo' },
		{ key: 'motivo_inicial', label: 'Motivo Inicial' },
		{ key: 'objetivo', label: 'Objetivo' },
		{ key: 'inicio', label: 'Fecha de Inicio' },
		{ key: 'fase', label: 'Fase' },
		{ key: 'id_cliente', label: 'ID Cliente' }
	];
</script>

<div class="view-container">
	<div class="controls">
		<button onclick={() => appState.toggleModalActivity()} class="butter">+Actividad</button>
		<FilterOpList />
		<Reload />
		<Filtro items={actividades} columns={configuracionColumnas} bind:filteredItems={filtrado} />
	</div>
	<Leyenda {steps} />
	{#each filtrado as event (event.id)}
		<CardActividadListPreview {event} />
	{/each}

	{#if filtrado.length === 0}
		<div class="no-results">
			<p>No se encontraron oportunidades con los filtros actuales.</p>
		</div>
	{/if}
</div>
