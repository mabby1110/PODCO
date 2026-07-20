<script lang="ts">
	import { page } from '$app/state';
	import { appState } from '$lib/stores/appState.svelte';
	import { agrupacionesStore } from '$lib/stores/AgrupacionesStore.svelte';
	import { agruparDatosPorRuta, obtenerDatosFiltrados } from '$lib/utils/filtro';
	import { agrupacionesOportunidades, categoriasOportunidad } from '$lib';
	import Lista from '$lib/components/App/Listas/Lista.svelte';
	import Searchbar from '$lib/components/App/Searchbar.svelte';
	import PanelFiltros from '$lib/components/App/PanelFiltros.svelte';
	import ExportarCSV from '$lib/components/App/ExportarCSV.svelte';
	import FiltroAgente from '$lib/components/App/FiltroAgente.svelte';
	import Filtro from '$lib/components/App/Filtro.svelte';
	import Agrupaciones from '$lib/components/App/Agrupaciones.svelte';
	import Grupo from '$lib/components/App/Grupo.svelte';
	import CardOpListPreview from '$lib/components/Oportunidad/CardOpListPreview.svelte';

	let { oportunidades } = $derived(page.data);
	let currentRoute = $derived(page.url.pathname);

	// guardamos lista para poder manipular data
	let lista = $derived(oportunidades);

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

<Lista>
	{#snippet acciones()}
		<Searchbar
			data={oportunidades}
			keyColumns={categoriasOportunidad.map((c) => c.key).concat(['clientes'])}
			bind:lista
		/>
		<PanelFiltros>
			{#snippet header()}
				<!-- <Leyenda /> -->
				<ExportarCSV {lista_ordenada} />
			{/snippet}
			{#snippet controles()}
				<button onclick={() => appState.toggleModalOp()} class="butter">+Oportunidad</button>
				<FiltroAgente />
				<Filtro categorias={categoriasOportunidad} />
				<Agrupaciones
					categorias={agrupacionesOportunidades}
					bind:agrupacionesSeleccionadas
					{grupos}
				/>
			{/snippet}
		</PanelFiltros>
	{/snippet}

	{#snippet contenido()}
		{#if !agrupacionesStore.filtersByRoute[currentRoute]}
			{#each lista_ordenada as elemento}
				<CardOpListPreview event={elemento} />
			{/each}
		{:else}
			{#each lista_agrupada_filtrada as agrupacion (agrupacion.grupo)}
				<Grupo {agrupacion} showByDefault={show}>
					{#each agrupacion.elementos as event (event.id)}
						<CardOpListPreview {event} />
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
