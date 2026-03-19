<script lang="ts">
	import CardOpListPreview from '$lib/components/Oportunidad/CardOpListPreview.svelte';
	import { filtrarConsecutivo } from '$lib/utils/util';
	import { filterStore } from '$lib/stores/filterStore.svelte';
	import FilterOpList from '$lib/components/FilterOpList.svelte';
	import { appState } from '$lib/stores/appState.svelte';
	import Leyenda from '../Leyenda.svelte';

	let { oportunidades } = $props();

	const eventList = $derived(
		filterStore.atributo !== ''
			? filtrarConsecutivo(filterStore.atributo, 'id_agente', oportunidades)
			: oportunidades
	);
</script>

<!-- <Leyenda /> -->
<div class="view-container">
	<div class="controls">
		<button onclick={() => appState.toggleModalOp()} class="butter">+Oportunidad</button>
		<FilterOpList />
	</div>
	{#each eventList as event (event.id)}
		<CardOpListPreview {event} />
	{/each}
</div>
