<script lang="ts">
	import { page } from "$app/state";
	import { agrupacionesCliente, categoriasCliente } from "$lib";
	import Agrupaciones from "$lib/components/Acciones/Agrupaciones.svelte";
	import ExportarCSV from "$lib/components/Acciones/ExportarCSV.svelte";
	import Filtro from "$lib/components/Acciones/Filtro.svelte";
	import FiltroAgente from "$lib/components/Acciones/FiltroAgente.svelte";
	import PanelFiltros from "$lib/components/Acciones/PanelFiltros.svelte";
	import Searchbar from "$lib/components/Acciones/Searchbar.svelte";
	import Grupo from "$lib/components/Tarjetas/Grupo.svelte";
	import Vista from "$lib/components/Tarjetas/Vista.svelte";
	import CardClienteListPreview from "$lib/components/Vistas/Cliente/CardClienteListPreview.svelte";
	import { appState } from "$lib/stores/appState.svelte";
	import { StoreAgrupaciones } from "$lib/stores/StoreAgrupaciones.svelte";
	import { StoreModList } from "$lib/stores/StoreModList.svelte";
	import { extraerColumnas, filterData, groupData, sortData } from "$lib/utils/ModList";



	let { oportunidades } = $derived(page.data);
	let show = $derived($appState.min);
	let currentRoute = $derived(page.url.pathname);

	// Convertido a $state para soportar bind:lista
	let lista = $state(oportunidades);
	let columnasDinamicas = $derived(extraerColumnas(oportunidades));

	$effect(() => {
		lista = oportunidades;
	});

	let lista_ordenada = $derived(sortData(lista, currentRoute));
	let lista_filtrada = $derived(filterData(lista_ordenada, currentRoute));
	let lista_agrupada = $derived(groupData(lista_filtrada, currentRoute));

	let isGrouped = $derived(StoreModList.get(currentRoute).groupBy !== null);
</script>

<Vista>
	{#snippet acciones()}
		<Searchbar data={clientes} keyColumns={categoriasCliente.map((a) => a.key)} bind:lista />
		<PanelFiltros>
			{#snippet header()}
				<button onclick={() => appState.toggleModalClient()} class="butter">+Cliente</button>
				<ExportarCSV {lista_ordenada} />
			{/snippet}
			{#snippet controles()}
				<FiltroAgente />
				<Filtro categorias={categoriasCliente} />
				<Agrupaciones categorias={agrupacionesCliente} bind:agrupacionesSeleccionadas {grupos} />
			{/snippet}
		</PanelFiltros>
	{/snippet}

	{#snippet contenido()}
		{#if !StoreAgrupaciones.filtersByRoute[currentRoute]}
			{#each lista_ordenada as elemento}
				<CardClienteListPreview client={elemento} />
			{/each}
		{:else}
			{#each lista_agrupada as agrupacion (agrupacion.columna)}
				<Grupo {agrupacion} showByDefault={show}>
					{#each agrupacion.items as elemento (elemento.id)}
						<CardClienteListPreview client={elemento} />
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
