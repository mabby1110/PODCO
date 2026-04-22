<script lang="ts">
	import CalendarWeek from '$lib/components/CalendarWeek.svelte';
	import { page } from '$app/state';
	import { procesarDatosReactivos } from '$lib/utils/filtro';

	let { oportunidades, actividades } = $derived(page.data);
	let allActivities = $derived(oportunidades.concat(actividades));
	
	const listaAgrupada = $derived.by(() => procesarDatosReactivos(allActivities));

</script>

<div class="page-content">
	<CalendarWeek {listaAgrupada} />
</div>
