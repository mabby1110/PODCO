<script lang="ts">
	import CardC from '$lib/components/CardC.svelte';
	import FilterClientList from '$lib/components/FilterClientList.svelte';
	import { profile } from '$lib/stores/profileStore.svelte';

	let { agentes, clients } = $props();

	type SortField =
		| 'razon_social'
		| 'ubicacion'
		| 'tipo_prospeccion'
		| 'ultima_actualizacion'
		| 'oportunidades';
	type SortOrder = 'asc' | 'desc';

	let sortField = $state<SortField>('razon_social');
	let sortOrder = $state<SortOrder>('asc');

	// toggle vista
	let showGlobal = $state(false);
	let canGlobal = $derived($profile?.isAdmin === true);

	const sinAgente = $derived(clients?.filter((c) => c.id_agente == '') ?? []);
	const misClientes = $derived(clients?.filter((c) => c.id_agente === $profile?.id) ?? []);
	const todos = $derived(clients ?? []);

	const clientesPorAgente = $derived(
		(agenteId: string) => clients?.filter((c) => c.id_agente === agenteId) ?? []
	);

	function sortClients(clientList: typeof clients) {
		return [...clientList].sort((a, b) => {
			let aVal = a[sortField] || '';
			let bVal = b[sortField] || '';

			if (sortField === 'oportunidades') {
				aVal = parseInt(aVal) || 0;
				bVal = parseInt(bVal) || 0;
			}

			if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
			if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
			return 0;
		});
	}
</script>

<div class="controls">
	<h2>Clientes</h2>

	<div class="controls-row">
		<FilterClientList bind:sortField bind:sortOrder />

		{#if canGlobal}
			<button class="butter" type="button" onclick={() => (showGlobal = !showGlobal)}>
				{showGlobal ? 'Vista por agente' : 'Vista global'}
			</button>
		{/if}
	</div>
</div>

<div class="view-container">
	{#if canGlobal && showGlobal}
		<h3>Todos <span class="count">({todos.length})</span></h3>
		<div class="list">
			{#each sortClients(todos) as client (client.id)}
				<CardC {client} />
			{/each}
		</div>
	{:else if $profile?.isAdmin}
		<h3>Sin Asignar <span class="count">({sinAgente.length})</span></h3>
		<div class="list">
			{#each sortClients(sinAgente) as client (client.id)}
				<CardC {client} />
			{/each}
		</div>

		{#each agentes as agente (agente.id)}
			{@const clientesAgente = clientesPorAgente(agente.id)}
			<h3>{agente.nombre} <span class="count">({clientesAgente.length})</span></h3>
			<div class="list">
				{#each sortClients(clientesAgente) as client (client.id)}
					<CardC {client} />
				{/each}
			</div>
		{/each}
	{:else}
		<h3>{$profile?.nombre} <span class="count">({misClientes.length})</span></h3>
		<div class="list">
			{#each sortClients(misClientes) as client (client.id)}
				<CardC {client} />
			{/each}
		</div>
	{/if}
</div>

<style>
	.controls-row {
		display: flex;
		gap: var(--a);
		align-items: center;
		flex-wrap: wrap;
	}

	.view-container {
		display: flex;
		flex-direction: column;
		width: 100%;
		padding: 0 var(--d) var(--a) var(--b);
		gap: var(--b);
	}

	.list {
		min-height: 20vh;
		max-height: 80vh;

		display: flex;
		flex-direction: column;
		gap: var(--a);

		overflow: auto;

		border: 1px solid var(--color-secondary);
		border-radius: var(--a);
		padding: var(--a) var(--b);
	}

	.count {
		font-weight: normal;
		color: var(--text-secondary, #666);
		font-size: 0.9em;
	}
</style>
