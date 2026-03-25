<script lang="ts">
	import { goto } from '$app/navigation';
	import { selectedClient } from '$lib/stores/selectedClient';
	let { client } = $props();

	function select() {
		selectedClient.set(client.id);
		goto(`?/${$selectedClient?.id}`);
	}
</script>

<a href="./clientes/{client.id}" class="card-list-preview" onclick={select}>
	<b>{client.razon_social}</b>
	<p>oportunidades abiertas: {client.oportunidades ?? 0}</p>
</a>