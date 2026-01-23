<script lang="ts">
	import CardB from '$lib/components/CardB.svelte';
	import { filtrarConsecutivo } from '$lib/utils/util';
	import { filterStore } from '$lib/stores/filterStore.svelte';
	import { fade } from 'svelte/transition';

	let { actividades } = $props();

	// Lista base SIEMPRE reactiva al cambio de data.actividades
	const eventList = $derived(
		filterStore.atributo !== ''
			? filtrarConsecutivo(filterStore.atributo, 'id_agente', actividades)
			: actividades
	);
</script>

<div class="calentar-list-container" in:fade>
	<div class="op-list">
		{#each eventList as event (event.id_oportunidad)}
			<CardB {event} />
		{/each}
	</div>
</div>

<style>
	.calentar-list-container {
		display: flex;
		flex-direction: column;
		overflow: auto;
		gap: var(--b);
		width: 100%;
	}

	.op-list {
		display: flex;
		flex-direction: column;
		gap: var(--b);
	}
</style>
