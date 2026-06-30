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
	import { agruparDatosPorRuta, obtenerDatosFiltrados, procesarDatosReactivos } from '$lib/utils/filtro';
	import ModalMovimiento from './ModalMovimiento.svelte';
	import Panel from '../App/Panel.svelte';

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
		console.log('lista: ', agrupacionesSeleccionadas);
		if (agrupacionesSeleccionadas.length > 0) {
			lista_agrupada?.filter((a) => agrupacionesSeleccionadas.includes(a.grupo));
		}
	});

	let show = $derived($appState.min);
</script>

<div class="view-container">
	<div class="controls">
		<button onclick={() => appState.toggleModalInventario()} class="butter">+Producto</button>
		<Searchbar data={inventario} keyColumns={['serie', 'codigo', 'descripcion', 'categorias']} bind:lista />
		<PanelFiltros>
			{#snippet controles()}
				<Agrupaciones
					categorias={agrupacionesInventario}
					bind:agrupacionesSeleccionadas
					{grupos}
				/>
				<Filtro categorias={categoriasInventario} />
			{/snippet}
		</PanelFiltros>
		<Panel tituloBoton="Productos Seleccionados">
			{#snippet header()}
				<div class="campos-grupo">
					<div class="header">
						<h3>Seleccion de inventario</h3>
						<p>{page.data.profile.nombre}</p>
					</div>
				</div>
			{/snippet}
			{#snippet controles()}
				<ModalMovimiento />
			{/snippet}
		</Panel>
	</div>

	<div class="view-content">
		{#each lista_agrupada_filtrada as agrupacion (agrupacion.grupo)}
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
