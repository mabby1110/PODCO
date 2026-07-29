<script lang="ts">
	import { page } from '$app/state';
	import { agrupacionesInventario, categoriasInventario } from '$lib';
	import Agrupaciones from '$lib/components/Acciones/Agrupaciones.svelte';
	import ExportarCSV from '$lib/components/Acciones/ExportarCSV.svelte';
	import Filtro from '$lib/components/Acciones/Filtro.svelte';
	import PanelFiltros from '$lib/components/Acciones/PanelFiltros.svelte';
	import Searchbar from '$lib/components/Acciones/Searchbar.svelte';
	import Grupo from '$lib/components/Tarjetas/Grupo.svelte';
	import Panel from '$lib/components/Tarjetas/Panel.svelte';
	import Vista from '$lib/components/Tarjetas/Vista.svelte';
	import TarjetaListaInventario from '$lib/components/Vistas/Inventario/TarjetaListaInventario.svelte';
	import FormPedidos from '$lib/components/Vistas/Inventario/Pedidos/FormPedidos.svelte';
	import ListaPedidos from '$lib/components/Vistas/Inventario/Pedidos/ListaPedidos.svelte';
	import { appState } from '$lib/stores/appState.svelte';
	import { StoreAgrupaciones } from '$lib/stores/StoreAgrupaciones.svelte';
	import { agruparDatosPorRuta, obtenerDatosFiltrados } from '$lib/utils/filtro';

	let { inventario } = $derived(page.data);
	let currentRoute = $derived(page.url.pathname);

	// guardamos lista para poder manipular data
	let lista = $derived(inventario);

	// cadena de variables reactivas, data > lista > lista_odenada > lista_agrupada
	let lista_ordenada = $derived(obtenerDatosFiltrados(lista, currentRoute));
	let lista_agrupada = $derived(agruparDatosPorRuta(lista_ordenada, currentRoute));

	let grupos = $derived(
		lista_agrupada.map((e) => {
			return { grupo: e.grupo, tamaño: e.elementos.length };
		})
	);

	/* Es necesario una variable reactiva ya que los derived son solo de lectura,
	lista_agrupada ya maneja la reactividad contra lista ordenada
	por lo que bloquea todo lo demas que modifique su valor actual
	*/
	let agrupacionesSeleccionadas: string[] = $state(grupos.map((a: any) => a.grupo));
	let lista_agrupada_filtrada = $derived(
		agrupacionesSeleccionadas.length > 0
			? lista_agrupada.filter((a) => agrupacionesSeleccionadas.includes(a.grupo))
			: lista_agrupada
	);

	$effect(() => {
		if (agrupacionesSeleccionadas.length > 0) {
			lista_agrupada?.filter((a) => agrupacionesSeleccionadas.includes(a.grupo));
		}
	});

	let show = $derived($appState.min);

	let view = $state(true);
	function handleview() {
		view = !view;
	}
</script>

<Vista>
	{#snippet acciones()}
		<Searchbar
			data={inventario}
			keyColumns={['serie', 'codigo', 'descripcion', 'categorias']}
			bind:lista
		/>
		<Panel tituloBoton="Pedidos">
			{#snippet header()}
				<button class="butter" onclick={handleview}>{view ? 'Lista' : '+Borrador'}</button>
			{/snippet}
			{#snippet contenido()}
				{#if view}
					<FormPedidos bind:view />
				{:else}
					<ListaPedidos bind:view />
				{/if}
			{/snippet}
		</Panel>
		<PanelFiltros>
			{#snippet header()}
				<button onclick={() => appState.toggleModalInventario()} class="butter">+Producto</button>
				<ExportarCSV {lista_ordenada} />
			{/snippet}
			{#snippet controles()}
				<Filtro categorias={categoriasInventario} />
				<Agrupaciones categorias={agrupacionesInventario} bind:agrupacionesSeleccionadas {grupos} />
			{/snippet}
		</PanelFiltros>
	{/snippet}
	{#snippet contenido()}
		{#if !StoreAgrupaciones.filtersByRoute[currentRoute]}
			{#each lista_ordenada as elemento}
				<TarjetaListaInventario producto={elemento} />
			{/each}
		{:else}
			{#each lista_agrupada_filtrada as agrupacion (agrupacion.grupo)}
				<Grupo {agrupacion} showByDefault={show}>
					{#each agrupacion.elementos as elemento (elemento.id)}
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
