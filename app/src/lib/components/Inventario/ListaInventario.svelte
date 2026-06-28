<script lang="ts">
	import Filtro from '$lib/components/App/Filtro.svelte';
	import { appState } from '$lib/stores/appState.svelte';
	import { agrupacionesInventario, categoriasInventario } from '$lib';
	import Grupo from '../Grupo.svelte';
	import PreviewListaProducto from './PreviewListaProducto.svelte';
	import Agrupaciones from '../App/Agrupaciones.svelte';
	import PanelFiltros from '../App/PanelFiltros.svelte';
	import Searchbar from '../App/Searchbar.svelte';
	import { page } from '$app/state';
	import { procesarDatosReactivos } from '$lib/utils/filtro';
	import ProductosSeleccionados from './ProductosSeleccionados.svelte';
	import Panel from '../App/Panel.svelte';

	let { inventario } = $derived(page.data);

	let data = $derived(inventario);
	let lista = $derived(inventario);

	let currentRoute = $derived(page.url.pathname);
	const listaAgrupada = $derived.by(() => procesarDatosReactivos(lista, currentRoute));
	let show = $derived($appState.min);

	let agrupaciones = $derived(
		listaAgrupada.map((e) => {
			return { grupo: e.grupo, tamaño: e.elementos.length };
		})
	);

	let agrupacionesSeleccionadas: string[] = $state([]);

	let listaFiltrada = $derived(
		agrupacionesSeleccionadas.length === 0
			? listaAgrupada
			: listaAgrupada.filter((a) => agrupacionesSeleccionadas.includes(a.grupo))
	);
</script>

<div class="view-container">
	<div class="controls">
		<button onclick={() => appState.toggleModalInventario()} class="butter">+Producto</button>
		<Searchbar {data} keyColumns={['serie', 'codigo', 'descripcion', 'categorias']} bind:lista />
		<PanelFiltros>
			{#snippet header()}
				<button onclick={appState.toggleMin} class="butter">
					{show ? 'min' : 'max'}
				</button>
			{/snippet}
			{#snippet controles()}
				<Agrupaciones
					categorias={agrupacionesInventario}
					bind:agrupacionesSeleccionadas
					{agrupaciones}
				/>
				<Filtro categorias={categoriasInventario} />
			{/snippet}
		</PanelFiltros>
		<Panel tituloBoton="Productos Seleccionados">
			{#snippet controles()}
				<ProductosSeleccionados />
			{/snippet}
		</Panel>
	</div>

	<div class="view-content">
		{#each listaFiltrada as agrupacion (agrupacion.grupo)}
			<Grupo {agrupacion} showByDefault={show}>
				{#each agrupacion.elementos as event (event.id)}
					<PreviewListaProducto {event} />
				{/each}
			</Grupo>
		{:else}
			<div class="no-results">
				<p>No se encontraron productos con los filtros actuales.</p>
			</div>
		{/each}
	</div>
</div>

<style>
	.view-container {
		display: flex;
		flex-direction: column;
		gap: var(--a);
		padding-bottom: var(--f);
	}
	.no-results {
		text-align: center;
		padding: 2rem;
		color: #64748b;
	}
</style>
