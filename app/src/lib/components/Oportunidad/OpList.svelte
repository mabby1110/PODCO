<script lang="ts">
	import CardOpListPreview from '$lib/components/Oportunidad/CardOpListPreview.svelte';
	import Filtro from '$lib/components/App/Filtro.svelte';
	import { appState } from '$lib/stores/appState.svelte';
	import { agrupacionesOportunidades, categoriasOportunidad } from '$lib';
	import Agrupaciones from '../App/Agrupaciones.svelte';
	import Grupo from '../Grupo.svelte';
	import Leyenda from '../Leyenda.svelte';
	import PanelFiltros from '../App/PanelFiltros.svelte';

	let { listaAgrupada } = $props();

	let show = $derived($appState.min);

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
</script>

<div class="view-container">
	<div class="controls">
		<button onclick={() => appState.toggleModalOp()} class="butter">+Oportunidad</button>
		<button onclick={appState.toggleMin} class="butter">
			{show ? 'min' : 'max'}
		</button>

		<PanelFiltros>
			{#snippet controles()}
				<div class="panel">
					<Leyenda />
				</div>
				<Filtro categorias={categoriasOportunidad} />
				<Agrupaciones
					categorias={agrupacionesOportunidades}
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
					<CardOpListPreview {event} />
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
