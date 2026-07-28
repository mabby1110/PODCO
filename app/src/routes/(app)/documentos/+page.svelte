<script lang="ts">
	import { page } from "$app/state";
	import { agrupacionesDocumentos, categoriasDocumentos } from "$lib";
	import Agrupaciones from "$lib/components/Acciones/Agrupaciones.svelte";
	import ExportarCSV from "$lib/components/Acciones/ExportarCSV.svelte";
	import Filtro from "$lib/components/Acciones/Filtro.svelte";
	import FiltroAgente from "$lib/components/Acciones/FiltroAgente.svelte";
	import Searchbar from "$lib/components/Acciones/Searchbar.svelte";
	import PanelFiltros from "$lib/components/Panel/PanelFiltros.svelte";
	import Grupo from "$lib/components/Tarjetas/Grupo.svelte";
	import Vista from "$lib/components/Tarjetas/Vista.svelte";
	import TarjetaListaDocumentos from "$lib/components/Vistas/Documentos/TarjetaListaDocumentos.svelte";
	import { appState } from "$lib/stores/appState.svelte";
	import { StoreAgrupaciones } from "$lib/stores/StoreAgrupaciones.svelte";
	import { agruparDatosPorRuta, obtenerDatosFiltrados } from "$lib/utils/filtro";


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

<Vista>
	{#snippet acciones()}
		<Searchbar data={documentos} keyColumns={categoriasDocumentos.map((a) => a.key)} bind:lista />
		<PanelFiltros>
			{#snippet header()}
				<ExportarCSV {lista_ordenada} />
			{/snippet}
			{#snippet controles()}
				<FiltroAgente />
				<Filtro categorias={categoriasDocumentos} />
				<Agrupaciones categorias={agrupacionesDocumentos} bind:agrupacionesSeleccionadas {grupos} />
			{/snippet}
		</PanelFiltros>
	{/snippet}
	{#snippet contenido()}
		{#if !StoreAgrupaciones.filtersByRoute[currentRoute]}
			{#each lista_ordenada as elemento}
				<TarjetaListaDocumentos event={elemento} />
			{/each}
		{:else}
			{#each lista_agrupada_filtrada as agrupacion (agrupacion.grupo)}
				<Grupo {agrupacion} showByDefault={show}>
					{#each agrupacion.elementos as event (event.id)}
						<TarjetaListaDocumentos {event} />
					{/each}
				</Grupo>
			{/each}
		{/if}
	{/snippet}
</Vista>
