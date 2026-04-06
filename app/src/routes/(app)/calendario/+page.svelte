<script lang="ts">
	import CalendarWeek from '$lib/components/CalendarWeek.svelte';
	import { selectedOp } from '$lib/stores/selectedOp.js';
	import { selectedActivity } from '$lib/stores/selectedActivity.js';
	import { filtrarConsecutivo } from '$lib/utils/util.js';
	import { filterStore } from '$lib/stores/filterStore.svelte.js';
	import { page } from '$app/state';

	let { oportunidades, actividades } = $derived(page.data);
	let allActivities = $derived(oportunidades.concat(actividades));
	const events = $derived(
		filterStore.atributo !== ''
			? filtrarConsecutivo(filterStore.atributo, 'id_agente', allActivities)
			: allActivities
	);

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			if ($selectedOp) selectedOp.clear();
			if ($selectedActivity) selectedActivity.clear();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="page-content">
	<CalendarWeek {events} />
</div>
