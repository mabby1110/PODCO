<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import DocListPreview from '../Documentos/DocListPreview.svelte';
	let { event, isEditing } = $props();

	const eventData = $derived.by(() => {
		if (!event) return null;
		return {
			...event
		};
	});
	function confirmDelete() {
		return async ({ formElement, cancel }: any) => {
			if (!confirm('¿Seguro que deseas borrar este pedido?')) {
				cancel();
				return;
			}

			await invalidateAll();
		};
	}
</script>

<DocListPreview ocultarAcciones>
	{#snippet header()}
		<h3 class="codigo">{eventData?.inventario.descripcion}</h3>
	{/snippet}
	{#snippet content()}
		{#if eventData?.inventario}
			<p>{eventData?.id_agente}</p>
		{/if}
		<p class="codigo">{eventData?.no_orden}</p>
		<p class="codigo">{eventData?.id_oportunidad}</p>
	{/snippet}
	{#snippet meta()}
		<p>p/u: {eventData?.precio_unitario} USD</p>
		<p>cantidad: {eventData?.cantidad}</p>
		<p>total: {eventData?.precio_unitario * eventData?.cantidad}</p>
	{/snippet}
	{#snippet acciones()}
		{#if eventData.fase <= 1 && isEditing}
			<form method="POST" action="/pedidos?/delete" use:enhance={confirmDelete}>
				<input type="hidden" name="id" value={eventData.id} />
				<button class="butter" type="submit">Borrar</button>
			</form>
		{/if}
	{/snippet}
</DocListPreview>

<style>
	.codigo {
		min-width: 15%;
	}
</style>
