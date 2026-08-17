<script lang="ts">
	import { page } from '$app/state';
	import ExportarCSV from '$lib/components/Acciones/ExportarCSV.svelte';
	import PanelFiltros from '$lib/components/Acciones/PanelFiltros.svelte';
	import Searchbar from '$lib/components/Acciones/Searchbar.svelte';
	import Grupo from '$lib/components/Tarjetas/Grupo.svelte';
	import Panel from '$lib/components/Tarjetas/Panel.svelte';
	import Vista from '$lib/components/Tarjetas/Vista.svelte';
	import FormPedidos from '$lib/components/Vistas/Pedidos/FormPedidos.svelte';
	import { appState } from '$lib/stores/appState.svelte';
	import { extraerColumnas, filterData, groupData, sortData } from '$lib/utils/ModList';
	import { StoreModList } from '$lib/stores/StoreModList.svelte';
	import ModList from '$lib/components/Acciones/ModList.svelte';
	import TarjetaPedido from '$lib/components/Vistas/Pedidos/TarjetaPedido.svelte';
	import { StorePedido } from '$lib/stores/StorePedido.svelte';
	import { StorePedidoNuevo } from '$lib/stores/StorePedidoNuevo.svelte';
	import { goto } from '$app/navigation';

	let { pedidos } = $derived(page.data);
	let show = $derived($appState.min);
	let showPanel = $state(false);
	let currentRoute = $derived(page.url.pathname);

	// Convertido a $state para soportar bind:lista
	let lista = $state(pedidos);
	let columnasDinamicas = $derived(extraerColumnas(pedidos));

	$effect(() => {
		lista = pedidos;
	});

	let lista_ordenada = $derived(sortData(lista, currentRoute));
	let lista_filtrada = $derived(filterData(lista_ordenada, currentRoute));
	let lista_agrupada = $derived(groupData(lista_filtrada, currentRoute));

	let isGrouped = $derived(StoreModList.get(currentRoute).groupBy !== null);

	function handleEdit(elementos: any[]) {
		StorePedido.limpiar();
		goto('/inventario');
		showPanel = true;
		elementos.forEach((item) => {
			if (item.id_agrupacion) {
				// si el pedido ya pertenece a una agrupacion solo agregar para editar
				StorePedido.agregar(item);
			} else {
				// es un articulo nuevo
				const cantidad = item.inventario.cantidad || 1;
				for (let i = 0; i < cantidad; i++) {
					StorePedidoNuevo.agregar(item.inventario);
				}
			}
		});
	}

	const copiarAExcel = (elementos: any[]) => {
		const cabeceras = 'Cantidad\tDescripción\tMoneda\tPrecio';
		const filas = elementos
			.map(
				(item) =>
					`${item.inventario.cantidad || 0}\t${item.inventario.descripcion || ''}\tUSD\t${item.inventario.precio || 0}`
			)
			.join('\n');

		navigator.clipboard.writeText(`${cabeceras}\n${filas}`);
	};
</script>

<Vista>
	{#snippet acciones()}
		<Searchbar
			data={pedidos}
			keyColumns={['serie', 'codigo', 'descripcion', 'categorias']}
			bind:lista
		/>
		<Panel tituloBoton="Pedido" show={showPanel}>
			{#snippet header()}
				<a href="/inventario" class="butter">Inventario</a>
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
				<ModList {columnasDinamicas} route={currentRoute} agrupar ordenar />
			{/snippet}
		</PanelFiltros>
	{/snippet}
	{#snippet contenido()}
		{#if !isGrouped}
			{#each lista_ordenada as item}
				<div class="panel">
					<TarjetaPedido {item} />
				</div>
			{/each}
		{:else}
			{#each lista_agrupada as agrupacion (agrupacion.columna)}
				<Grupo {agrupacion} showByDefault={show}>
					<div class="panel">
						{#each agrupacion.items.sort((i)=>i.estatus) as item (item.id)}
							<TarjetaPedido {item} />
						{/each}
						<div class="acciones-tabla">
							<button class="butter" type="button" onclick={() => copiarAExcel(agrupacion.items)}>
								Copiar Datos
							</button>
							<button class="butter" type="button" onclick={() => handleEdit(agrupacion.items)}>
								Editar
							</button>
						</div>
					</div>
				</Grupo>
			{:else}
				<div class="no-results">
					<p>No se encontraron datos.</p>
				</div>
			{/each}
		{/if}
	{/snippet}
</Vista>

<style>
	.panel {
		padding: var(--a);
	}
	.acciones-tabla {
		display: flex;
		gap: var(--a);
		justify-self: flex-end;
	}
</style>
