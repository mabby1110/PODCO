<script lang="ts">
	import CardActividadListPreview from '$lib/components/Actividad/CardActividadListPreview.svelte';
	import { filtrarConsecutivo } from '$lib/utils/util';
	import { filterStore } from '$lib/stores/filterStore.svelte';
	import FilterOpList from '$lib/components/FilterOpList.svelte';
	import { appState } from '$lib/stores/appState.svelte';

	let { actividades } = $props();
	const eventList = $derived(
		filterStore.atributo !== ''
			? filtrarConsecutivo(filterStore.atributo, 'id_agente', actividades)
			: actividades
	);
</script>

<div class="controls">
	<h2>Actividades</h2>
	<button onclick={() => appState.toggleModalActivity()} class="butter">+Actividad</button>
	<FilterOpList />
</div>
<div class="view-container">
	<div class="op-list">
		{#each eventList as event (event.id)}
			<CardActividadListPreview {event} />
		{/each}
	</div>
</div>

<style>
	.controls {
		display: flex;
		flex-wrap: wrap;
		gap: var(--a);
		padding: 0 0 var(--b);
		justify-content: flex-end;
	}
	.view-container {
		display: flex;
		flex-direction: column;
		overflow: auto;
		width: 100%;
		padding: 0 0 var(--b);
		gap: var(--b);
	}
	.op-list {
		display: flex;
		flex-direction: column;
		gap: var(--b);
		justify-content: flex-start;
	}
</style>
