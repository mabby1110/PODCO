<script lang="ts">
	import { page } from '$app/state';
	import { agrupacionesCliente, categoriasCliente } from '$lib';
	import Agrupaciones from '$lib/components/App/Agrupaciones.svelte';
	import ExportarCSV from '$lib/components/App/ExportarCSV.svelte';
	import Filtro from '$lib/components/App/Filtro.svelte';
	import Lista from '$lib/components/App/Listas/Lista.svelte';
	import PanelFiltros from '$lib/components/App/PanelFiltros.svelte';
	import Searchbar from '$lib/components/App/Searchbar.svelte';
	import CardClienteListPreview from '$lib/components/Cliente/CardClienteListPreview.svelte';
	import FiltroAgente from '$lib/components/App/FiltroAgente.svelte';
	import Grupo from '$lib/components/App/Grupo.svelte';
	import { StoreAgrupaciones } from '$lib/stores/StoreAgrupaciones.svelte';
	import { appState } from '$lib/stores/appState.svelte';
	import { agruparDatosPorRuta, obtenerDatosFiltrados } from '$lib/utils/filtro';

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
		if (agrupacionesSeleccionadas.length > 0) {
			lista_agrupada?.filter((a) => agrupacionesSeleccionadas.includes(a.grupo));
		}
	});

	let show = $derived($appState.min);
	console.log('store', StoreAgrupaciones.filtersByRoute[currentRoute]);
</script>

<Lista>
	{#snippet acciones()}
		<Searchbar data={clientes} keyColumns={categoriasCliente.map((a) => a.key)} bind:lista />
		<PanelFiltros>
			{#snippet header()}
				<button onclick={() => appState.toggleModalClient()} class="butter">+Cliente</button>
				<ExportarCSV {lista_ordenada} />
			{/snippet}
			{#snippet controles()}
				<FiltroAgente />
				<Filtro categorias={categoriasCliente} />
				<Agrupaciones categorias={agrupacionesCliente} bind:agrupacionesSeleccionadas {grupos} />
			{/snippet}
		</PanelFiltros>
	{/snippet}

	{#snippet contenido()}
		{#if !StoreAgrupaciones.filtersByRoute[currentRoute]}
			{#each lista_ordenada as elemento}
				<CardClienteListPreview client={elemento} />
			{/each}
		{:else}
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
		{/if}
	{/snippet}
</Lista>
