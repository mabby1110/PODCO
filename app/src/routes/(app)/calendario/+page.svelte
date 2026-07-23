<script lang="ts">
	import CalendarWeek from '$lib/components/Calendario/CalendarWeek.svelte';
	import { page } from '$app/state';
	import { procesarDatosReactivos } from '$lib/utils/filtro';
	import CalendarioAnual from '$lib/components/Calendario/CalendarioAnual.svelte';

	let { oportunidades, actividades } = $derived(page.data);
	let allActivities = $derived(oportunidades.concat(actividades));
    let currentRoute = $derived(page.url.pathname);
	
	const listaAgrupada = $derived.by(() => procesarDatosReactivos(allActivities, currentRoute));

</script>

<div class="page-content">
	<!-- <CalendarWeek {listaAgrupada} /> -->
	 <CalendarioAnual/>
</div>
