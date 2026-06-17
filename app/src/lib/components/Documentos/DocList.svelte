<script lang="ts">
	import CardOpListPreview from '$lib/components/Oportunidad/CardOpListPreview.svelte';
	import Filtro from '$lib/components/App/Filtro.svelte';
	import { appState } from '$lib/stores/appState.svelte';
	import { agrupacionesDocumentos, categoriasDocumentos } from '$lib';
	import Agrupaciones from '../Agrupaciones.svelte';
	import Grupo from '../Grupo.svelte';
	import Leyenda from '../Leyenda.svelte';
	import CardDocPreview from './CardDocPreview.svelte';

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
	<div class="controls"><button onclick={appState.toggleMin} class="butter">
			{show ? 'min' : 'max'}
		</button>
		<Filtro categorias={categoriasDocumentos} />
		<Agrupaciones
			categorias={agrupacionesDocumentos}
			bind:agrupacionesSeleccionadas
			{agrupaciones}
		/>
	</div>

	<Leyenda />

	{#each listaFiltrada as agrupacion (agrupacion.grupo)}
		<div class="grupo-dia">
			<Grupo {agrupacion} showByDefault={show}>
				{#each agrupacion.elementos as event (event.id)}
					<CardDocPreview {event}/>
				{/each}
			</Grupo>
		</div>
	{:else}
		<div class="no-results">
			<p>No se encontraron documentos con los filtros actuales.</p>
		</div>
	{/each}
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
