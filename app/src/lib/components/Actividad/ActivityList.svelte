<!-- ActivityList -->
<script lang="ts">
	import { appState } from '$lib/stores/appState.svelte';
	import CardActividadListPreview from '$lib/components/Actividad/CardActividadListPreview.svelte';
	import FilterOpList from '../FilterOpList.svelte';
	import Leyenda from '../Leyenda.svelte';
	import Reload from '../Reload.svelte';
	import Filtro from '../Filtro.svelte';
	import { agrupacioneActividades, columnasActividad } from '$lib';
	import { agruparPor } from '$lib/utils/util';
	import Select from '../Select.svelte';

	let { actividades } = $props();

	let filtrado = $derived([...actividades]);
	let selected = $state('');

	// let actividadesAgrupadas = $derived(agruparPorFecha(filtrado, 'inicio'));
	let actividadesAgrupadas = $derived(agruparPor(filtrado, selected));

	let steps = [
		{ label: 'Programada', color: 'var(--color-secondary)' },
		{ label: 'Finalizada', color: '#000000ee' }
	];
</script>

<div class="view-container">
	<div class="controls">
		<Reload />
		<FilterOpList />
		<button onclick={() => appState.toggleModalActivity()} class="butter">+Actividad</button>
		<Select options={agrupacioneActividades} bind:selected/>
		<Filtro items={actividades} columns={columnasActividad} bind:filteredItems={filtrado} />
	</div>
	<Leyenda {steps} />
	{#each actividadesAgrupadas as agrupacion (agrupacion.grupo)}
		<div class="grupo-dia">
			<h3 class="dia-header">{agrupacion.grupo}</h3>

			<div class="lista-eventos">
				{#each agrupacion.elementos as event (event.id)}
					<CardActividadListPreview {event} />
				{/each}
			</div>
		</div>
	{/each}

	{#if filtrado.length === 0}
		<div class="no-results">
			<p>No se encontraron actividades con los filtros actuales.</p>
		</div>
	{/if}
</div>

<style>
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

	.dia-header {
		margin: 0;
		padding-bottom: 0.5rem;
		border-bottom: 2px solid var(--color-muted, #e2e8f0);
		color: var(--color-text, #333);
		font-size: 1.1rem;
	}

	.lista-eventos {
		display: flex;
		flex-direction: column;
		gap: var(--a);
	}
</style>
