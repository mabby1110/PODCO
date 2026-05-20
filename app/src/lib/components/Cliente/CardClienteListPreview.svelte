<script lang="ts">
	import ListPreview from '../ListPreview.svelte';

	let { client } = $props();
</script>

<ListPreview href="./clientes/{client.id}">
	{#snippet header()}
		<h3>{client.razon_social}</h3>
	{/snippet}
	{#snippet meta()}
		<p>oportunidades abiertas: {client.op ?? 0}</p>
		<p>visitas: {client.visitas ?? 0}</p>
	{/snippet}
</ListPreview>
