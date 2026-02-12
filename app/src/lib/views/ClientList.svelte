<script lang="ts">
	import CardC from '$lib/components/CardC.svelte';
	import FilterClientList from '$lib/components/FilterClientList.svelte';
	import { profile } from '$lib/stores/profileStore.svelte';

	let { agentes, clients } = $props();

	type SortField =
		| 'razon_social'
		| 'ubicacion'
		| 'tipo_prospeccion'
		| 'fecha_creacion'
		| 'oportunidades';
	type SortOrder = 'asc' | 'desc';

	let sortField = $state<SortField>('razon_social');
	let sortOrder = $state<SortOrder>('asc');

	const sinAgente = $derived(clients?.filter((c) => c.id_agente == '') ?? []);
	const misClientes = $derived(clients?.filter((c) => c.id_agente === $profile?.id) ?? []);

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
	<FilterClientList bind:sortField bind:sortOrder />
</div>

<div class="view-container">
	{#if $profile?.isAdmin}
		<h3>Sin Asignar <span class="count">({sinAgente.length})</span></h3>
		<div class="list">
			{#each sortClients(sinAgente) as client (client.id)}
				<CardC {client} />
			{/each}
		</div>

		{#each agentes as agente (agente.id)}
			{@const clientesAgente = clientesPorAgente(agente.id)}
			<h3>{agente.nombre} <span class="count">({clientesAgente.length})</span></h3>
			<!-- <p>{agente.id}</p> -->
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
	.view-container {
		display: flex;
		flex-direction: column;
		overflow: auto;
		width: 100%;
		padding: 0 var(--a) var(--b);
		gap: var(--b);
	}
	.list {
		min-height: 40vh;
		max-height: 60vh;
		display: flex;
		gap: var(--a);
		flex-direction: column;
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
