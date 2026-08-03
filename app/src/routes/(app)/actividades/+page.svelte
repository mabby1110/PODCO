<script lang="ts">
	import { page } from '$app/state';
	import { appState } from '$lib/stores/appState.svelte';
	import TarjetaListaActividades from '$lib/components/Vistas/Actividad/TarjetaListaActividades.svelte';
	import Vista from '$lib/components/Tarjetas/Vista.svelte';
	import Searchbar from '$lib/components/Acciones/Searchbar.svelte';
	import ExportarCSV from '$lib/components/Acciones/ExportarCSV.svelte';
	import Grupo from '$lib/components/Tarjetas/Grupo.svelte';
	import PanelFiltros from '$lib/components/Acciones/PanelFiltros.svelte';
	import ModList from '$lib/components/Acciones/ModList.svelte';
	import { extraerColumnas, filterData, groupData, sortData } from '$lib/utils/ModList';
	import { StoreModList } from '$lib/stores/StoreModList.svelte';

	let { actividades } = $derived(page.data);
	let show = $derived($appState.min);
	let currentRoute = $derived(page.url.pathname);

	// Convertido a $state para soportar bind:lista
	let lista = $state(actividades);
	let columnasDinamicas = $derived(extraerColumnas(actividades));
	$effect(() => {
		lista = actividades;
	});

	let lista_ordenada = $derived(sortData(lista, currentRoute));
	let lista_filtrada = $derived(filterData(lista_ordenada, currentRoute));
	let lista_agrupada = $derived(groupData(lista_filtrada, currentRoute));

	let isGrouped = $derived(StoreModList.get(currentRoute).groupBy !== null);
</script>

<Vista>
	{#snippet acciones()}
		<Searchbar data={actividades} keyColumns={columnasDinamicas.map((a) => a.key)} bind:lista />
		<PanelFiltros>
			{#snippet header()}
				<button onclick={() => appState.toggleModalActivity()} class="butter">+Actividad</button>
				<ExportarCSV {lista_ordenada} />
				<!-- <Leyenda {steps} /> -->
			{/snippet}
            {#snippet controles()}
                <ModList {columnasDinamicas} route={currentRoute} ordenar agrupar/>
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
