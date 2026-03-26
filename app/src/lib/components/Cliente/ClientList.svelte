<script lang="ts">
	import { page } from '$app/state';
	import { agrupacioneCliente, columnasCliente } from '$lib';
	import CardClienteListPreview from '$lib/components/Cliente/CardClienteListPreview.svelte';
	import { appState } from '$lib/stores/appState.svelte';
	import { profile } from '$lib/stores/profileStore.svelte';
	import { agruparPor } from '$lib/utils/util';
	import Filtro from '../Filtro.svelte';
	import Grupo from '../Grupo.svelte';
	import Reload from '../Reload.svelte';
	import Select from '../Select.svelte';

	let { clientes } = $derived(page.data);
	console.log(clientes);

	let filtrado = $derived([...clientes]);

	let selected = $state('');
	let listaAgrupada = $derived(agruparPor(filtrado, selected));
</script>

<div class="view-container">
	<div class="controls">
		<Reload />
		<button onclick={() => appState.toggleModalClient()} class="butter">+Cliente</button>
		<Select options={agrupacioneCliente} bind:selected />
		<Filtro items={clientes} columns={columnasCliente} bind:filteredItems={filtrado} />
	</div>
	{#each listaAgrupada as agrupacion (agrupacion.grupo)}
		<div class="grupo-dia">
			<Grupo {agrupacion}>
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
