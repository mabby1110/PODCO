<script lang="ts">
	import CalendarWeek from '$lib/components/CalendarWeek.svelte';
	import { selectedOp } from '$lib/stores/selectedOp.js';
	import { selectedActivity } from '$lib/stores/selectedActivity.js';
	import { page } from '$app/state';
	import { procesarDatosReactivos } from '$lib/utils/filtro';

	let { oportunidades, actividades } = $derived(page.data);
	let allActivities = $derived(oportunidades.concat(actividades));

	
	const listaAgrupada = $derived.by(() => procesarDatosReactivos(allActivities));

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			if ($selectedOp) selectedOp.clear();
			if ($selectedActivity) selectedActivity.clear();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="page-content">
	<CalendarWeek {listaAgrupada} />
</div>
