<script lang="ts">
	import { goto } from '$app/navigation';
	import { selectedClient } from '$lib/stores/selectedClient';
	let { client } = $props();

	function select() {
		selectedClient.set(client.id);
		goto(`?/${$selectedClient?.id}`);
	}
</script>

<a href="./clientes/{client.id}" class="card" onclick={select}>
	<b>{client.razon_social}</b>
	<p>oportunidades abiertas: {client.oportunidades ?? 0}</p>
</a>

<style>
	.card {
		text-decoration: none;
		color: inherit;
		position: relative;
		padding: var(--a);
		background-color: var(--color-secondary);
		backdrop-filter: blur(16px);
		width: 100%;
		min-height: var(--e);
		display: flex;
		gap: var(--a);
		flex-wrap: wrap;
		align-items: center;
		text-align: left;
		border-style: none;
		border-width: 0;
		border-radius: var(--a);
		cursor: pointer;
	}
</style>
