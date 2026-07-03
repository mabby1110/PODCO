<script lang="ts">
	import DocListPreview from '../Documentos/DocListPreview.svelte';
	import ContadorProducto from '../Inventario/ContadorProducto.svelte';
	import ListPreview from '../ListPreview.svelte';
	let { event } = $props();

	const eventData = $derived.by(() => {
		if (!event) return null;
		return {
			...event
		};
	});
	console.log(eventData);
</script>

<DocListPreview>
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
</DocListPreview>

<style>
	.codigo {
		min-width: 15%;
	}
</style>
