<script lang="ts">
	import { page } from '$app/state';
	import { appState } from '$lib/stores/appState.svelte';
	import { StoreAgrupaciones } from '$lib/stores/StoreAgrupaciones.svelte';
	import { categoriasActividad, agrupacionesActividades } from '$lib';
	import { agruparDatosPorRuta, obtenerDatosFiltrados } from '$lib/utils/filtro';
	import TarjetaListaActividades from '$lib/components/Vistas/Actividad/TarjetaListaActividades.svelte';
	import Vista from '$lib/components/Tarjetas/Vista.svelte';
	import Searchbar from '$lib/components/Acciones/Searchbar.svelte';
	import PanelFiltros from '$lib/components/Panel/PanelFiltros.svelte';
	import ExportarCSV from '$lib/components/Acciones/ExportarCSV.svelte';
	import FiltroAgente from '$lib/components/Acciones/FiltroAgente.svelte';
	import Filtro from '$lib/components/Acciones/Filtro.svelte';
	import Agrupaciones from '$lib/components/Acciones/Agrupaciones.svelte';
	import Grupo from '$lib/components/Tarjetas/Grupo.svelte';

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

<Vista>
	{#snippet acciones()}
		<Searchbar data={actividades} keyColumns={categoriasActividad.map((a) => a.key)} bind:lista />
		<PanelFiltros>
			{#snippet header()}
				<button onclick={() => appState.toggleModalActivity()} class="butter">+Actividad</button>
				<ExportarCSV {lista_ordenada} />
				<!-- <Leyenda {steps} /> -->
			{/snippet}
			{#snippet controles()}
				<FiltroAgente />
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
		{#if !StoreAgrupaciones.filtersByRoute[currentRoute]}
			{#each lista_ordenada as elemento}
				<TarjetaListaActividades event={elemento} />
			{/each}
		{:else}
			{#each lista_agrupada_filtrada as agrupacion (agrupacion.grupo)}
				<Grupo {agrupacion} showByDefault={show}>
					{#each agrupacion.elementos as event (event.id)}
						<TarjetaListaActividades {event} />
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
