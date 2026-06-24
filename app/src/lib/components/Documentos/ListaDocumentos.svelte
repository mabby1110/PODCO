<script lang="ts">
	import Filtro from '$lib/components/App/Filtro.svelte';
	import { appState } from '$lib/stores/appState.svelte';
	import { agrupacionesDocumentos, categoriasDocumentos } from '$lib';
	import Agrupaciones from '../App/Agrupaciones.svelte';
	import Grupo from '../Grupo.svelte';
	import Leyenda from '../Leyenda.svelte';
	import CardDocPreview from './CardDocPreview.svelte';
	import PanelFiltros from '../App/PanelFiltros.svelte';
	import { page } from '$app/state';
	import { procesarDatosReactivos } from '$lib/utils/filtro';
	import Searchbar from '../App/Searchbar.svelte';
	import FiltroAgente from '../FiltroAgente.svelte';

	let { documentos } = $derived(page.data);
	
	let data = $derived(documentos);
	let lista = $derived(documentos);
    let currentRoute = $derived(page.url.pathname);
    const listaAgrupada = $derived.by(() => procesarDatosReactivos(lista, currentRoute));

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

	let show = $derived($appState.min);
</script>

<div class="view-container">
	<div class="controls">
		<button onclick={appState.toggleMin} class="butter">
			{show ? 'min' : 'max'}
		</button>
		<FiltroAgente />
		<Searchbar {data} keyColumns={categoriasDocumentos.map(a=>a.key)} bind:lista />
		<PanelFiltros>
			{#snippet controles()}
				<Filtro categorias={categoriasDocumentos} />
				<Agrupaciones
					categorias={agrupacionesDocumentos}
					bind:agrupacionesSeleccionadas
					{agrupaciones}
				/>
				<Leyenda />
			{/snippet}
		</PanelFiltros>
	</div>

	<div class="view-content">
		{#each listaFiltrada as agrupacion (agrupacion.grupo)}
			<Grupo {agrupacion} showByDefault={show}>
				{#each agrupacion.elementos as event (event.id)}
					<CardDocPreview {event} />
				{/each}
			</Grupo>
		{:else}
			<div class="no-results">
				<p>No se encontraron documentos con los filtros actuales.</p>
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

	.grupo-dia {
		display: flex;
		flex-direction: column;
		gap: var(--a);
	}
</style>
