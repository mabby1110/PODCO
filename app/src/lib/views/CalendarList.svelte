<script lang="ts">
	import CardB from '$lib/components/CardB.svelte';
	import { filtrarConsecutivo } from '$lib/utils/util';
	import { filterStore } from '$lib/stores/filterStore.svelte';
	import Filter from '$lib/components/Filter.svelte';

	let { actividades } = $props();

	// Lista base SIEMPRE reactiva al cambio de data.actividades
	const eventList = $derived(
		filterStore.atributo !== ''
			? filtrarConsecutivo(filterStore.atributo, 'id_agente', actividades)
			: actividades
	);
</script>

<div class="calendar-controls">
	<h3>Lista</h3>
	<Filter />
</div>
<div class="view-container">
	<div class="op-list">
		{#each eventList as event (event.id_oportunidad)}
			<CardB {event} />
		{/each}
	</div>
</div>

<style>
	.calendar-controls {
		display: flex;
		flex-wrap: wrap;
		gap: var(--a);
		padding: 0 0 var(--b);
		justify-content: flex-end;
	}
	.calendar-controls h3 {
		flex-grow: 1;
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
