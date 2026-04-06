<script lang="ts">
	import { page } from '$app/state';
	import ActivityList from '$lib/components/Actividad/ActivityList.svelte';
	import { filterStore } from '$lib/stores/filterStore.svelte.js';
	import { filtrarConsecutivo } from '$lib/utils/util.js';
	import { slide } from 'svelte/transition';

	let { actividades } = $derived(page.data);
	const events = $derived(
		filterStore.atributo !== ''
			? filtrarConsecutivo(filterStore.atributo, 'id_agente', actividades)
			: actividades
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
