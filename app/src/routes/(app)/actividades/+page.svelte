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
	import Controles from '$lib/components/Acciones/Controles.svelte';

	let { actividades } = $derived(page.data);
	let lista = $state(actividades);
	let currentRoute = $derived(page.url.pathname);

	let columnasDinamicas = $derived(extraerColumnas(actividades));
	let lista_ordenada = $derived(sortData(lista, currentRoute));
	let lista_filtrada = $derived(filterData(lista_ordenada, currentRoute));
	let lista_agrupada = $derived(groupData(lista_filtrada, currentRoute));
	let isGrouped = $derived(StoreModList.get(currentRoute).groupBy !== null);
	$effect(() => {
		lista = actividades;
	});

	let show = $derived($appState.min);
</script>

<Vista>
	{#snippet acciones()}
		<Controles>
			{#snippet header()}
				<button onclick={() => appState.toggleModalActivity()} class="butter">+Actividad</button>
				<ExportarCSV {lista_ordenada} />
			{/snippet}
			{#snippet acciones()}
				<ModList {columnasDinamicas} route={currentRoute} ordenar agrupar />
				<Searchbar data={actividades} keyColumns={columnasDinamicas.map((a) => a.key)} bind:lista />
			{/snippet}
		</Controles>
	{/snippet}
	{#snippet contenido()}
		{#if !isGrouped}
			{#each lista_filtrada as actividad}
				<TarjetaListaActividades {actividad} />
			{/each}
		{:else}
			{#each lista_agrupada as agrupacion (agrupacion.columna)}
				<Grupo {agrupacion}>
					{#snippet children(elemento: any)}
						<TarjetaListaActividades actividad={elemento} />
					{/snippet}
				</Grupo>
			{:else}
				<div class="no-results">
					<p>No se encontraron datos.</p>
				</div>
			{/each}
		{/if}
	{/snippet}
</Vista>
