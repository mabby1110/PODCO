<script lang="ts">
	import { agrupacionesCliente, columnasCliente } from '$lib';
	import CardClienteListPreview from '$lib/components/Cliente/CardClienteListPreview.svelte';
	import { appState } from '$lib/stores/appState.svelte';
	import { selectedGroupStore } from '$lib/stores/groupFilter.svelte';
	import { agruparPor } from '$lib/utils/util';
	import FilterOpList from '../FilterOpList.svelte';
	import Filtro from '../Filtro.svelte';
	import Grupo from '../Grupo.svelte';
	import Reload from '../Reload.svelte';
	import Select from '../Select.svelte';

	let { clientes } = $props();

	let filtrado = $derived([...clientes]);
	let selected = $state(selectedGroupStore.selectedGroup ?? '');
	let show = $derived(selected?false:true);
	$effect(() => {
		selectedGroupStore.selectedGroup = selected != '' ? selected : '';
	});
	let listaAgrupada = $derived(agruparPor(filtrado, selected));
</script>

<div class="view-container">
	<div class="controls">
		<Reload />
		<button onclick={() => appState.toggleModalClient()} class="butter">+Cliente</button>
		<button onclick={() => show=!show} class="butter">{show?"min":"max"}</button>
		<FilterOpList />
		<Select options={agrupacionesCliente} defaultOption="Agrupar todos" bind:selected />
		<Filtro items={clientes} columns={columnasCliente} bind:filteredItems={filtrado} />
	</div>
	{#each listaAgrupada as agrupacion (agrupacion.grupo)}
		<div class="grupo-dia">
			<Grupo {agrupacion} showByDefault={show}>
				{#each agrupacion.elementos as elemento (elemento.id)}
					<CardClienteListPreview client={elemento} />
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
</style>
