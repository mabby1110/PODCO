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
	import { StorePedidoEditar } from '$lib/stores/pedidos/StorePedidoEditar.svelte';
	import { profile } from '$lib/stores/profileStore.svelte';
	import TarjetaPedidoLista from '$lib/components/Vistas/Pedidos/TarjetaPedidoLista.svelte';
	import Controles from '$lib/components/Acciones/Controles.svelte';

	let pedidos = $derived(page.data.pedidos.filter((p) => $profile?.isAdmin ?? p.fase <= 2));

	let show = $derived($appState.min);
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

	// HELPERS
</script>

<Vista>
	{#snippet acciones()}
		<button onclick={() => StorePedidoEditar.toggleModal()} class="honey accion">~Pedido</button>
		<Controles>
			{#snippet header()}
				<button onclick={() => appState.toggleModalInventario()} class="jelly">+Producto</button>
				<ExportarCSV {lista_ordenada} />
			{/snippet}
			{#snippet acciones()}
				<ModList {columnasDinamicas} route={currentRoute} agrupar ordenar />
				<Searchbar
					data={pedidos}
					keyColumns={['serie', 'codigo', 'descripcion', 'categorias', 'id_agrupacion']}
					bind:lista
				/>
			{/snippet}
		</Controles>
	{/snippet}
	{#snippet contenido()}
		{#if !isGrouped}
			<TarjetaPedidoLista {pedidos} />
		{:else}
			{#each lista_agrupada as agrupacion (agrupacion.columna)}
				<Grupo {agrupacion}>
					{#snippet children(elemento: any)}
						<TarjetaPedidoLista pedidos={agrupacion.items} />
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
