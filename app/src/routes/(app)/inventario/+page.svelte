<script lang="ts">
	import Filtro from '$lib/components/App/Filtro.svelte';
	import { appState } from '$lib/stores/appState.svelte';
	import { agrupacionesInventario, categoriasInventario } from '$lib';
	import { page } from '$app/state';
	import { agruparDatosPorRuta, obtenerDatosFiltrados } from '$lib/utils/filtro';
	import Lista from '$lib/components/App/Listas/Lista.svelte';
	import Searchbar from '$lib/components/App/Searchbar.svelte';
	import PanelFiltros from '$lib/components/App/PanelFiltros.svelte';
	import ExportarCSV from '$lib/components/App/ExportarCSV.svelte';
	import Agrupaciones from '$lib/components/App/Agrupaciones.svelte';
	import Grupo from '$lib/components/Grupo.svelte';
	import PreviewListaProducto from '$lib/components/Inventario/PreviewListaProducto.svelte';
	import { agrupacionesStore } from '$lib/stores/agrupacionesStore.svelte';
	import FormPedidos from '$lib/components/Pedidos/FormPedidos.svelte';
	import Panel from '$lib/components/App/Panel.svelte';

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
</script>

<Lista header="Inventario">
	{#snippet acciones()}
		<Searchbar
			data={inventario}
			keyColumns={['serie', 'codigo', 'descripcion', 'categorias']}
			bind:lista
		/>
		<Panel tituloBoton="Pedido">
			{#snippet contenido()}
				<FormPedidos />
			{/snippet}
		</Panel>
		<PanelFiltros>
			{#snippet header()}
				<ExportarCSV {lista_ordenada} />
				<button onclick={() => appState.toggleModalInventario()} class="butter">+Producto</button>
			{/snippet}
			{#snippet controles()}
				<Filtro categorias={categoriasInventario} />
				<Agrupaciones categorias={agrupacionesInventario} bind:agrupacionesSeleccionadas {grupos} />
			{/snippet}
		</PanelFiltros>
	{/snippet}
	{#snippet contenido()}
		{#if !agrupacionesStore.filtersByRoute[currentRoute]}
			{#each lista_ordenada as elemento}
				<PreviewListaProducto producto={elemento} />
			{/each}
		{:else}
			{#each lista_agrupada_filtrada as agrupacion (agrupacion.grupo)}
				<Grupo {agrupacion} showByDefault={show}>
					{#each agrupacion.elementos as elemento (elemento.id)}
						<PreviewListaProducto producto={elemento} />
					{/each}
				</Grupo>
			{:else}
				<div class="no-results">
					<p>No se encontraron datos.</p>
				</div>
			{/each}
		{/if}
	{/snippet}
</Lista>