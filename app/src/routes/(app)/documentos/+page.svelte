<script lang="ts">
	import Filtro from '$lib/components/App/Filtro.svelte';
	import { appState } from '$lib/stores/appState.svelte';
	import { agrupacionesDocumentos, categoriasDocumentos } from '$lib';
	import { page } from '$app/state';
	import { agruparDatosPorRuta, obtenerDatosFiltrados } from '$lib/utils/filtro';
	import Lista from '$lib/components/App/Listas/Lista.svelte';
	import Searchbar from '$lib/components/App/Searchbar.svelte';
	import PanelFiltros from '$lib/components/App/PanelFiltros.svelte';
	import FiltroAgente from '$lib/components/FiltroAgente.svelte';
	import ExportarCSV from '$lib/components/App/ExportarCSV.svelte';
	import Agrupaciones from '$lib/components/App/Agrupaciones.svelte';
	import Grupo from '$lib/components/Grupo.svelte';
	import CardDocPreview from '$lib/components/Documentos/CardDocPreview.svelte';
	import { agrupacionesStore } from '$lib/stores/AgrupacionesStore.svelte';

	let { documentos } = $derived(page.data);
	let currentRoute = $derived(page.url.pathname);

	// guardamos lista para poder manipular data
	let lista = $derived(documentos);

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

<Lista>
	{#snippet acciones()}
		<Searchbar data={documentos} keyColumns={categoriasDocumentos.map((a) => a.key)} bind:lista />
		<PanelFiltros>
			{#snippet header()}
				<FiltroAgente />
				<ExportarCSV {lista_ordenada} />
			{/snippet}
			{#snippet controles()}
				<Filtro categorias={categoriasDocumentos} />
				<Agrupaciones categorias={agrupacionesDocumentos} bind:agrupacionesSeleccionadas {grupos} />
			{/snippet}
		</PanelFiltros>
	{/snippet}
	{#snippet contenido()}
		{#if !agrupacionesStore.filtersByRoute[currentRoute]}
			{#each lista_ordenada as elemento}
				<CardDocPreview event={elemento} />
			{/each}
		{:else}
			{#each lista_agrupada_filtrada as agrupacion (agrupacion.grupo)}
				<Grupo {agrupacion} showByDefault={show}>
					{#each agrupacion.elementos as event (event.id)}
						<CardDocPreview {event} />
					{/each}
				</Grupo>
			{/each}
		{/if}
	{/snippet}
</Lista>
