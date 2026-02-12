<script lang="ts">
	import CardC from '$lib/components/CardC.svelte';
	import { profile } from '$lib/stores/profileStore.svelte';

	let { clients } = $props();

	const sinAgente = $derived(clients?.filter((c) => c.id_agente == '') ?? []);
</script>

<div class="view-container">
	<h3>{$profile.nombre}</h3>
	<div class="list">
		{#each clients.filter((c) => c.id_agente === $profile.id) as client (client.id)}
			<CardC {client} />
		{/each}
	</div>

	<h3>Sin Asignar</h3>
	<div class="list">
		{#each sinAgente as client (client.id)}
			<CardC {client} />
		{/each}
	</div>
</div>

<style>
	.view-container {
		display: flex;
		flex-direction: column;
		overflow: auto;
		gap: var(--b);
		width: 100%;
	}
	.list {
		min-height: 40vh;
		max-height: 60vh;
		display: flex;
		flex-direction: column;
		overflow: scroll;
	}
</style>
