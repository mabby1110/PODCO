<!-- ActivityList -->
<script lang="ts">
	import { appState } from '$lib/stores/appState.svelte';
	import CardActividadListPreview from '$lib/components/Actividad/CardActividadListPreview.svelte';
	import Leyenda from '../Leyenda.svelte';
	import Reload from '../Reload.svelte';
	import Filtro from '../Filtro.svelte';
	import { agrupacionesActividades, columnasActividad } from '$lib';
	import { agruparPor } from '$lib/utils/util';
	import Grupo from '../Grupo.svelte';
	import { selectedGroupStore } from '$lib/stores/groupFilter.svelte';

	let { actividades } = $props();

	let filtrado = $derived([...actividades]);
	let selected = $state(selectedGroupStore.selectedGroup ?? '');
	let show = $state(selected ? false : true);
	$effect(() => {
		selectedGroupStore.selectedGroup = selected != '' ? selected : '';
	});
	let listaAgrupada = $derived(agruparPor(filtrado, selected));

	let steps = [
		{ label: 'Programada', color: 'var(--color-secondary)' },
		{ label: 'Finalizada', color: '#000000ee' }
	];
</script>

<div class="view-container">
	<div class="controls">
		<Reload />
		<button onclick={() => appState.toggleModalActivity()} class="butter">+Actividad</button>
		<button onclick={() => (show = !show)} class="butter">{show ? 'min' : 'max'}</button>
		<Filtro
			items={actividades}
			columns={columnasActividad}
			agrupaciones={agrupacionesActividades}
			bind:filteredItems={filtrado}
		/>
	</div>
	<Leyenda {steps} />
	{#each listaAgrupada as agrupacion (agrupacion.grupo)}
		<div class="grupo-dia">
			<Grupo {agrupacion} showByDefault={show}>
				{#each agrupacion.elementos as event (event.id)}
					<CardActividadListPreview {event} />
				{/each}
			</Grupo>
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
