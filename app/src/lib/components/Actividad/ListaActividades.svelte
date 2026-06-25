<script lang="ts">
	import { page } from '$app/state';
	import { appState } from '$lib/stores/appState.svelte';
	import CardActividadListPreview from '$lib/components/Actividad/CardActividadListPreview.svelte';
	import Filtro from '../App/Filtro.svelte';
	import { categoriasActividad, agrupacionesActividades } from '$lib';
	import Agrupaciones from '../App/Agrupaciones.svelte';
	import Grupo from '../Grupo.svelte';
	import Leyenda from '../Leyenda.svelte';
	import PanelFiltros from '../App/PanelFiltros.svelte';
	import { procesarDatosReactivos } from '$lib/utils/filtro';
	import Searchbar from '../App/Searchbar.svelte';
	import FiltroAgente from '../FiltroAgente.svelte';

	let { actividades } = $derived(page.data);

	let data = $derived(actividades);
	let lista = $derived(actividades);
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
	const steps = [
		{ label: 'Actividad programada', color: 'var(--color-secondary)' },
		{ label: 'Finalizada', color: '#000000ee' }
	];
</script>

<div class="view-container">
	<div class="controls">
		<button onclick={() => appState.toggleModalActivity()} class="butter">+Actividad</button>
		<button onclick={appState.toggleMin} class="butter">
			{show ? 'min' : 'max'}
		</button>
		<FiltroAgente />
		<Searchbar {data} keyColumns={categoriasActividad.map((a) => a.key)} bind:lista />
		<PanelFiltros>
			{#snippet header()}
				<Leyenda {steps} />
			{/snippet}
			{#snippet controles()}
				<Filtro categorias={categoriasActividad} />
				<Agrupaciones
					categorias={agrupacionesActividades}
					bind:agrupacionesSeleccionadas
					{agrupaciones}
				/>
			{/snippet}
		</PanelFiltros>
	</div>
	<div class="view-content">
		{#each listaFiltrada as agrupacion (agrupacion.grupo)}
			<Grupo {agrupacion} showByDefault={show}>
				{#each agrupacion.elementos as event (event.id)}
					<CardActividadListPreview {event} />
				{/each}
			</Grupo>
		{:else}
			<div class="no-results">
				<p>No se encontraron oportunidades con los filtros actuales.</p>
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
