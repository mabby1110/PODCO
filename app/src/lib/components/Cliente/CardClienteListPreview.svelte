<script lang="ts">
	let { client } = $props();
</script>

<a href="./clientes/{client.id}" class="card-list-preview">
	<b>{client.razon_social}</b>
	<p>oportunidades abiertas: {client.op ?? 0}</p>
</a>
