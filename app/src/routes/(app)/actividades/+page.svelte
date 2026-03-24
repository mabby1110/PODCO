<script lang="ts">
	import ActivityList from '$lib/components/Actividad/ActivityList.svelte';
	import { selectedActivity } from '$lib/stores/selectedActivity.js';
	import CardActividad from '$lib/components/Actividad/CardActividad.svelte';
	import { filterStore } from '$lib/stores/filterStore.svelte.js';
	import { filtrarConsecutivo } from '$lib/utils/util.js';

	let { data } = $props();
	const events = $derived(
		filterStore.atributo !== ''
			? filtrarConsecutivo(filterStore.atributo, 'id_agente', data.actividades)
			: data.actividades
	);
</script>

<div class="page-content">
	{#if $selectedActivity}
		<section class="selected">
			<CardActividad />
		</section>
	{:else}
		<section>
			<ActivityList actividades={data.actividades} />
		</section>
	{/if}
</div>

<style>
	.page-content {
		display: flex;
		flex-direction: column;
		overflow: auto;
	}
</style>
