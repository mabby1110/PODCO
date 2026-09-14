<script lang="ts">
	import { page } from '$app/state';
	import ExportarCSV from '$lib/components/Acciones/ExportarCSV.svelte';
	import PanelFiltros from '$lib/components/Acciones/PanelFiltros.svelte';
	import Searchbar from '$lib/components/Acciones/Searchbar.svelte';
	import Grupo from '$lib/components/Tarjetas/Grupo.svelte';
	import Vista from '$lib/components/Tarjetas/Vista.svelte';
	import { appState } from '$lib/stores/appState.svelte';
	import { extraerColumnas, filterData, groupData, sortData } from '$lib/utils/ModList';
	import { StoreModList } from '$lib/stores/StoreModList.svelte';
	import ModList from '$lib/components/Acciones/ModList.svelte';

	let { inventario } = $derived(page.data);
	let show = $derived($appState.min);
	let currentRoute = $derived(page.url.pathname);
	let lista = $state(inventario);
	let columnasDinamicas = $derived(extraerColumnas(inventario));

	$effect(() => {
		lista = inventario;
	});

	let lista_ordenada = $derived(sortData(lista, currentRoute));
	let lista_filtrada = $derived(filterData(lista_ordenada, currentRoute));
	let lista_agrupada = $derived(groupData(lista_filtrada, currentRoute));

	let isGrouped = $derived(StoreModList.get(currentRoute).groupBy !== null);
</script>

<Vista>
	{#snippet acciones()}
		<Searchbar
			data={inventario}
			keyColumns={['serie', 'codigo', 'descripcion', 'categorias']}
			bind:lista
		/>
		<button onclick={() => appState.toggleModalProducto()} class="butter">+Restock</button>
		<PanelFiltros>
			{#snippet header()}
				<ExportarCSV {lista_ordenada} />
			{/snippet}
			{#snippet controles()}
				<ModList {columnasDinamicas} route={currentRoute} agrupar ordenar />
			{/snippet}
		</PanelFiltros>
	{/snippet}
	{#snippet contenido()}
		{#if lista.lenght > 0}
			{#if !isGrouped}
				{#each lista_ordenada as elemento}
					{elemento}
				{/each}
			{:else}
				{#each lista_agrupada as agrupacion (agrupacion.columna)}
					<Grupo {agrupacion} showByDefault={show}>
						{#each agrupacion.items as elemento (elemento.id)}
							{elemento}
						{/each}
					</Grupo>
				{/each}
			{/if}
		{:else}
			<div class="no-results">
				<p>No se encontraron datos.</p>
			</div>
		{/if}
	{/snippet}
</Vista>
