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
	import TarjetaProducto from '$lib/components/Vistas/Catalogo/TarjetaProducto.svelte';
	import Controles from '$lib/components/Acciones/Controles.svelte';
	import { StorePedidoEditar } from '$lib/stores/pedidos/StorePedidoEditar.svelte';

	let { catalogo } = $derived(page.data);
	let show = $derived($appState.min);
	let currentRoute = $derived(page.url.pathname);
	let lista = $state(catalogo);
	let columnasDinamicas = $derived(extraerColumnas(catalogo));

	$effect(() => {
		lista = catalogo;
	});

	let lista_ordenada = $derived(sortData(lista, currentRoute));
	let lista_filtrada = $derived(filterData(lista_ordenada, currentRoute));
	let lista_agrupada = $derived(groupData(lista_filtrada, currentRoute));

	let isGrouped = $derived(StoreModList.get(currentRoute).groupBy !== null);
</script>

<Vista>
	{#snippet portada()}
		{currentRoute}
	{/snippet}
	{#snippet acciones()}
		<button onclick={() => StorePedidoEditar.toggleModal()} class="honey accion">~Pedido</button>
		<Controles>
			{#snippet header()}
				<ExportarCSV {lista_ordenada} />
				<!-- <button onclick={() => appState.toggleModalTipoProducto()} class="butter accion">+Tipo</button> -->
				<button onclick={() => appState.toggleModalProducto()} class="butter"
					>+Producto Nuevo</button
				>
			{/snippet}
			{#snippet acciones()}
				<ModList {columnasDinamicas} route={currentRoute} agrupar ordenar />
				<Searchbar data={catalogo} keyColumns={['codigo']} bind:lista />
			{/snippet}
		</Controles>
	{/snippet}
	{#snippet contenido()}
		{#if !isGrouped}
			{#each lista_ordenada as elemento}
				<TarjetaProducto {elemento} />
			{/each}
		{:else}
			{#each lista_agrupada as agrupacion (agrupacion.columna)}
				<Grupo {agrupacion} showByDefault={show}>
					{#each agrupacion.items as elemento (elemento.id)}
						<TarjetaProducto {elemento} />
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
