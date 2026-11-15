<script lang="ts">
	import { goto } from '$app/navigation';
	import ListPreview from '$lib/components/Tarjetas/ListPreview.svelte';

	let { client } = $props();
</script>

<ListPreview>
	{#snippet titulo()}
		<h3>{client.nombre_comercial || client.razon_social}</h3>
		{#if client.razon_social}
			<p class="tiny">R.S: {client.razon_social}</p>
		{/if}
	{/snippet}
	{#snippet contenido()}
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
	{#snippet metaDatos()}
		<p>{client.agentes.nombre}</p>
		<p>oportunidades: {client.oportunidades.length || 0}</p>
	{/snippet}

	{#snippet acciones()}
		<button
			class="butter accion"
			onclick={(e) => {
				e.stopPropagation();
				goto(`/actividades/${client.id}`);
			}}>ver</button
		>
	{/snippet}
</ListPreview>
