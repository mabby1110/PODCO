<script lang="ts">
	import ListPreview from '../ListPreview.svelte';

	let { client } = $props();
</script>

<ListPreview href="./clientes/{client.id}">
	{#snippet header()}
		<h3>{client.razon_social || client.nombre_comercial}</h3>
	{/snippet}
	{#snippet resume()}
		{client.sector}
	{/snippet}
	{#snippet content()}
		<div class="brief">
			<h3>Razón social:</h3>
			<p>{client.razon_social}</p>
		</div>
		<div class="brief">
			<h3>Gíro comercial:</h3>
			<p>{client?.descripcion}</p>
		</div>
		<div class="brief">
			<h3>Contactos:</h3>
			{#each client.contactos as contacto}
				{contacto.nombre}: {contacto.contactos.length} datos de contacto
			{/each}
		</div>
	{/snippet}
	{#snippet meta()}
		<p>oportunidades abiertas: {client.op ?? 0}</p>
		<p>visitas: {client.visitas ?? 0}</p>
	{/snippet}
</ListPreview>
