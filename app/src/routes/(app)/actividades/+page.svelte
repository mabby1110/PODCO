<script lang="ts">
	import { page } from '$app/state';
	import { appState } from '$lib/stores/appState.svelte';
	import { StoreAgrupaciones } from '$lib/stores/StoreAgrupaciones.svelte';
	import { categoriasActividad, agrupacionesActividades } from '$lib';
	import { agruparDatosPorRuta, obtenerDatosFiltrados } from '$lib/utils/filtro';
	import TarjetaListaActividades from '$lib/components/Vistas/Actividad/TarjetaListaActividades.svelte';
	import Vista from '$lib/components/Tarjetas/Vista.svelte';
	import Searchbar from '$lib/components/Acciones/Searchbar.svelte';
	import ExportarCSV from '$lib/components/Acciones/ExportarCSV.svelte';
	import FiltroAgente from '$lib/components/Acciones/FiltroAgente.svelte';
	import Filtro from '$lib/components/Acciones/Filtro.svelte';
	import Agrupaciones from '$lib/components/Acciones/Agrupaciones.svelte';
	import Grupo from '$lib/components/Tarjetas/Grupo.svelte';
	import PanelFiltros from '$lib/components/Acciones/PanelFiltros.svelte';
	import { onMount } from 'svelte';
	import { profile } from '$lib/stores/profileStore.svelte';
	import ModList from '$lib/components/Acciones/ModList.svelte';
	import { filterData, groupData, sortData } from '$lib/utils/ModList';
	import { StoreModList } from '$lib/stores/StoreModList.svelte';

    let { actividades } = $derived(page.data);
    let show = $derived($appState.min);
    let currentRoute = $derived(page.url.pathname);
    
    // Convertido a $state para soportar bind:lista
    let lista = $state(actividades);
    
    $effect(() => {
        lista = actividades;
    });

    let lista_ordenada = $derived(sortData(lista, currentRoute));
    let lista_filtrada = $derived(filterData(lista_ordenada, currentRoute));
    let lista_agrupada = $derived(groupData(lista_filtrada, currentRoute));
    
    let isGrouped = $derived(StoreModList.get(currentRoute).groupBy !== null);

    $effect(() => {
        console.log('Ordenada:', lista_ordenada);
        console.log('Filtrada:', lista_filtrada);
        console.log('Agrupada:', lista_agrupada);
    });
</script>

<Vista>
	{#snippet acciones()}
		<Searchbar data={actividades} keyColumns={categoriasActividad.map((a) => a.key)} bind:lista />
		<PanelFiltros>
			{#snippet header()}
				<button onclick={() => appState.toggleModalActivity()} class="butter">+Actividad</button>
				<ExportarCSV {lista_ordenada} />
				<!-- <Leyenda {steps} /> -->
			{/snippet}
            {#snippet controles()}
                <ModList camposAgrupacion={categoriasActividad} camposFiltro={categoriasActividad} route={currentRoute}/>
            {/snippet}
		</PanelFiltros>
	{/snippet}
	{#snippet contenido()}
		{#if !isGrouped}
			{#each lista_ordenada as elemento}
				<TarjetaListaActividades event={elemento} />
			{/each}
		{:else}
			{#each lista_agrupada as agrupacion (agrupacion.columna)}
				<Grupo {agrupacion} showByDefault={show}>
					{#each agrupacion.items as event (event.id)}
						<TarjetaListaActividades {event} />
					{/each}
				</Grupo>
			{:else}
				<div class="no-results">
					<p>No se encontraron datos.</p>
				</div>
			{/each}
		{/if}
	{/snippet}
</Vista>
