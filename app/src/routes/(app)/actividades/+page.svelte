<script lang="ts">
	import ActivityList from '$lib/components/Actividad/ActivityList.svelte';
	import { filterStore } from '$lib/stores/filterStore.svelte.js';
	import { filtrarConsecutivo } from '$lib/utils/util.js';
	import { slide } from 'svelte/transition';

	let { data } = $props();
	const events = $derived(
		filterStore.atributo !== ''
			? filtrarConsecutivo(filterStore.atributo, 'id_agente', data.actividades)
			: data.actividades
	);
</script>

<div class="page-content" transition:slide>
	<ActivityList actividades={events} />
</div>

<style>
	.page-content {
		display: flex;
		flex-direction: column;
		overflow: auto;
	}
</style>
