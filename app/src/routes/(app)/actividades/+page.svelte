<script lang="ts">
	import { page } from '$app/state';
	import { appState } from '$lib/stores/appState.svelte';
	import CardActividadListPreview from '$lib/components/Actividad/CardActividadListPreview.svelte';
	import { categoriasActividad, agrupacionesActividades } from '$lib';
	import { agruparDatosPorRuta, obtenerDatosFiltrados } from '$lib/utils/filtro';
	import PanelFiltros from '$lib/components/App/PanelFiltros.svelte';
	import FiltroAgente from '$lib/components/FiltroAgente.svelte';
	import Searchbar from '$lib/components/App/Searchbar.svelte';
	import ExportarCSV from '$lib/components/App/ExportarCSV.svelte';
	import Filtro from '$lib/components/App/Filtro.svelte';
	import Agrupaciones from '$lib/components/App/Agrupaciones.svelte';
	import Grupo from '$lib/components/Grupo.svelte';
	import Lista from '$lib/components/App/Listas/Lista.svelte';
	import { agrupacionesStore } from '$lib/stores/AgrupacionesStore.svelte';
	let { actividades } = $derived(page.data);
	let currentRoute = $derived(page.url.pathname);

	// guardamos lista para poder manipular data
	let lista = $derived(actividades);

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

	const steps = [
		{ label: 'Actividad programada', color: 'var(--color-secondary)' },
		{ label: 'Finalizada', color: '#000000ee' }
	];
</script>

<Lista>
	{#snippet acciones()}
		<Searchbar data={actividades} keyColumns={categoriasActividad.map((a) => a.key)} bind:lista />
		<button onclick={() => appState.toggleModalActivity()} class="butter">+Actividad</button>
		<PanelFiltros>
			{#snippet header()}
				<FiltroAgente />
				<ExportarCSV {lista_ordenada} />
				<!-- <Leyenda {steps} /> -->
			{/snippet}
			{#snippet controles()}
				<Filtro categorias={categoriasActividad} />
				<Agrupaciones
					categorias={agrupacionesActividades}
					bind:agrupacionesSeleccionadas
					{grupos}
				/>
			{/snippet}
		</PanelFiltros>
	{/snippet}
	{#snippet contenido()}
		{#if !agrupacionesStore.filtersByRoute[currentRoute]}
			{#each lista_ordenada as elemento}
				<CardActividadListPreview event={elemento} />
			{/each}
		{:else}
			{#each lista_agrupada_filtrada as agrupacion (agrupacion.grupo)}
				<Grupo {agrupacion} showByDefault={show}>
					{#each agrupacion.elementos as event (event.id)}
						<CardActividadListPreview {event} />
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
