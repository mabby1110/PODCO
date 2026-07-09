<script lang="ts">
	import ListPreview from '../App/Listas/ListPreview.svelte';

	let { client } = $props();
</script>

<ListPreview href="./clientes/{client.id}">
	{#snippet header()}
		<h3>{client.nombre_comercial || client.razon_social}</h3>
		{#if client.razon_social}
			<p class="tiny">{client.razon_social}</p>
		{/if}
	{/snippet}
	{#snippet content()}
		<div class="brief">
			<h3>Gíro comercial:</h3>
			<p>{client?.descripcion}</p>
		</div>
		<div class="brief">
			<h3>Contactos:</h3>
			<div class="brief-content">
				{#each client.contactos as contacto}
					<p>
						{contacto.nombre}
					</p>
				{/each}
			</div>
		</div>
	{/snippet}
	{#snippet meta()}
		<p>oportunidades abiertas: {client.op ?? 0}</p>
		<p>visitas: {client.visitas ?? 0}</p>
	{/snippet}
</ListPreview>
