<script lang="ts">
	import { page } from '$app/state';
	import { agrupacionesCliente, categoriasCliente } from '$lib';
	import CardClienteListPreview from '$lib/components/Cliente/CardClienteListPreview.svelte';
	import { appState } from '$lib/stores/appState.svelte';
	import { exportarCSV } from '$lib/utils/blobActions';
	import { agruparDatosPorRuta, obtenerDatosFiltrados } from '$lib/utils/filtro';
	import Agrupaciones from '../App/Agrupaciones.svelte';
	import ExportarCSV from '../App/ExportarCSV.svelte';
	import Filtro from '../App/Filtro.svelte';
	import PanelFiltros from '../App/PanelFiltros.svelte';
	import Searchbar from '../App/Searchbar.svelte';
	import FiltroAgente from '../FiltroAgente.svelte';
	import Grupo from '../Grupo.svelte';

	let { clientes } = $derived(page.data);
	let currentRoute = $derived(page.url.pathname);

	// guardamos lista para poder manipular data
	let lista = $derived(clientes);

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
		<ExportarCSV {lista_ordenada} />
		<button onclick={() => appState.toggleModalClient()} class="butter">+Cliente</button>
		<Searchbar data={clientes} keyColumns={categoriasCliente.map((a) => a.key)} bind:lista />
		<PanelFiltros>
			{#snippet header()}
				<FiltroAgente />
				<button onclick={appState.toggleMin} class="butter">
					{show ? 'min' : 'max'}
				</button>
			{/snippet}
			{#snippet controles()}
				<Filtro categorias={categoriasCliente} />
				<Agrupaciones
					categorias={agrupacionesCliente}
					bind:agrupacionesSeleccionadas
					{grupos}
				/>
			{/snippet}
		</PanelFiltros>
	</div>

	<div class="view-content">
		{#each lista_agrupada_filtrada as agrupacion (agrupacion.grupo)}
			<Grupo {agrupacion} showByDefault={show}>
				{#each agrupacion.elementos as elemento (elemento.id)}
					<CardClienteListPreview client={elemento} />
				{/each}
			</Grupo>
		{:else}
			<div class="no-results">
				<p>No se encontraron datos.</p>
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
