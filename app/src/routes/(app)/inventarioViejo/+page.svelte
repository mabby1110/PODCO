<script lang="ts">
	import { page } from '$app/state';
	import ExportarCSV from '$lib/components/Acciones/ExportarCSV.svelte';
	import PanelFiltros from '$lib/components/Acciones/PanelFiltros.svelte';
	import Searchbar from '$lib/components/Acciones/Searchbar.svelte';
	import Grupo from '$lib/components/Tarjetas/Grupo.svelte';
	import Panel from '$lib/components/Tarjetas/Panel.svelte';
	import Vista from '$lib/components/Tarjetas/Vista.svelte';
	import TarjetaListaInventario from '$lib/components/Vistas/Inventario/TarjetaListaInventario.svelte';
	import FormPedidos from '$lib/components/Vistas/Pedidos/FormPedidos.svelte';
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
		
		<Panel tituloBoton="Pedido" show={$appState.editarPedido}>
			{#snippet header()}
				<a href="/pedidos" class="butter">Lista pedidos</a>
			{/snippet}
			{#snippet contenido()}
				<FormPedidos />
			{/snippet}
		</Panel>
		<PanelFiltros>
			{#snippet header()}
				<button onclick={() => appState.toggleModalInventario()} class="butter">+Producto</button>
				<ExportarCSV {lista_ordenada} />
			{/snippet}
			{#snippet controles()}
				<ModList {columnasDinamicas} route={currentRoute} agrupar ordenar/>
			{/snippet}
		</PanelFiltros>
	{/snippet}
	{#snippet contenido()}
		{#if !isGrouped}
			{#each lista_ordenada as elemento}
				<TarjetaListaInventario producto={elemento} />
			{/each}
		{:else}
			{#each lista_agrupada as agrupacion (agrupacion.columna)}
				<Grupo {agrupacion} showByDefault={show}>
					{#each agrupacion.items as elemento (elemento.id)}
						<TarjetaListaInventario producto={elemento} />
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
