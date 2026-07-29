<script lang="ts">
	import { page } from "$app/state";
	import ExportarCSV from "$lib/components/Acciones/ExportarCSV.svelte";
	import Agrupaciones from "$lib/components/Acciones/Agrupaciones.svelte";
	import Grupo from "$lib/components/Tarjetas/Grupo.svelte";
	import Vista from "$lib/components/Tarjetas/Vista.svelte";
	import TarjetaListaOportunidades from "$lib/components/Vistas/Oportunidad/TarjetaListaOportunidades.svelte";
	import { appState } from "$lib/stores/appState.svelte";
	import { StoreAgrupaciones } from "$lib/stores/StoreAgrupaciones.svelte";
	import { agrupacionesOportunidades, categoriasOportunidad } from "$lib";
	import { agruparDatosPorRuta, obtenerDatosFiltrados } from "$lib/utils/filtro";
	import Searchbar from "$lib/components/Acciones/Searchbar.svelte";
	import FiltroAgente from "$lib/components/Acciones/FiltroAgente.svelte";
	import Filtro from "$lib/components/Acciones/Filtro.svelte";
	import PanelFiltros from "$lib/components/Acciones/PanelFiltros.svelte";


	let { oportunidades } = $derived(page.data);
	let currentRoute = $derived(page.url.pathname);
	let lista = $derived(oportunidades);
	let lista_ordenada = $derived(obtenerDatosFiltrados(lista, currentRoute));
	let lista_agrupada = $derived(agruparDatosPorRuta(lista_ordenada, currentRoute));
	
	let grupos = $derived(
		lista_agrupada.map((e) => {
			return { grupo: e.grupo, tamaño: e.elementos.length };
		})
	);
	
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

<Vista>
	{#snippet acciones()}
		<Searchbar
			data={oportunidades}
			keyColumns={categoriasOportunidad.map((c) => c.key).concat(['clientes'])}
			bind:lista
		/>
		<PanelFiltros>
			{#snippet header()}
				<!-- <Leyenda /> -->
				<button onclick={() => appState.toggleModalOp()} class="butter">+Oportunidad</button>
				<ExportarCSV {lista_ordenada} />
			{/snippet}
			{#snippet controles()}
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
		{#if !StoreAgrupaciones.filtersByRoute[currentRoute]}
			{#each lista_ordenada as elemento}
				<TarjetaListaOportunidades event={elemento} />
			{/each}
		{:else}
			{#each lista_agrupada_filtrada as agrupacion (agrupacion.grupo)}
				<Grupo {agrupacion} showByDefault={show}>
					{#each agrupacion.elementos as event (event.id)}
						<TarjetaListaOportunidades {event} />
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
