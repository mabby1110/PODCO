<script lang="ts">
	import { page } from '$app/state';
	import { agrupacionesCliente, categoriasCliente } from '$lib';
	import CardClienteListPreview from '$lib/components/Cliente/CardClienteListPreview.svelte';
	import { appState } from '$lib/stores/appState.svelte';
	import { procesarDatosReactivos } from '$lib/utils/filtro';
	import Agrupaciones from '../App/Agrupaciones.svelte';
	import Filtro from '../App/Filtro.svelte';
	import PanelFiltros from '../App/PanelFiltros.svelte';
	import Searchbar from '../App/Searchbar.svelte';
	import FiltroAgente from '../FiltroAgente.svelte';
	import Grupo from '../Grupo.svelte';

	let { clientes } = $derived(page.data);
	
	let data = $derived(clientes);
	let lista = $derived(clientes);
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
		<button onclick={() => appState.toggleModalClient()} class="butter">+Cliente</button>
		<button onclick={appState.toggleMin} class="butter">
			{show ? 'min' : 'max'}
		</button>
		<FiltroAgente />
		<Searchbar {data} keyColumns={categoriasCliente.map(a=>a.key)} bind:lista />
		<PanelFiltros>
			{#snippet controles()}
				<Filtro categorias={categoriasCliente} />
				<Agrupaciones
					categorias={agrupacionesCliente}
					bind:agrupacionesSeleccionadas
					{agrupaciones}
				/>
			{/snippet}
		</PanelFiltros>
	</div>

	<div class="view-content">
		{#each listaFiltrada as agrupacion (agrupacion.grupo)}
			<Grupo {agrupacion} showByDefault={show}>
				{#each agrupacion.elementos as elemento (elemento.id)}
					<CardClienteListPreview client={elemento} />
				{/each}
			</Grupo>
		{:else}
			<div class="no-results">
				<p>No se encontraron clientes con los filtros actuales.</p>
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
