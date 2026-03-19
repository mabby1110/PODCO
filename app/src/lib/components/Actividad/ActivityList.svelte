<script lang="ts">
	import CardActividadListPreview from '$lib/components/Actividad/CardActividadListPreview.svelte';
	import { filtrarConsecutivo } from '$lib/utils/util';
	import { filterStore } from '$lib/stores/filterStore.svelte';
	import FilterOpList from '$lib/components/FilterOpList.svelte';
	import { appState } from '$lib/stores/appState.svelte';
	import Leyenda from '../Leyenda.svelte';
	import Reload from '../Reload.svelte';

	let { actividades } = $props();
	let steps = [
		{ label: 'Programada', color: 'var(--color-secondary)' },
		{ label: 'Finalizada', color: '#000000ee' }
	];
	const eventList = $derived(
		filterStore.atributo !== ''
			? filtrarConsecutivo(filterStore.atributo, 'id_agente', actividades)
			: actividades
	);
</script>

<!-- <Leyenda {steps} /> -->
<div class="view-container">
	<div class="controls">
		<button onclick={() => appState.toggleModalActivity()} class="butter">+Actividad</button>
		<FilterOpList />
		<Reload />
	</div>
	{#each eventList as event (event.id)}
		<CardActividadListPreview {event} />
	{/each}
</div>
