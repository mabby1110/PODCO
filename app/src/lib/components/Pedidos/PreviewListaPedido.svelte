<script lang="ts">
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

<ListPreview style={eventData?.style} ocultarAcciones>
	{#snippet header()}
		<h3 class="codigo">{eventData?.profiles.nombre}</h3>
		{#if eventData?.inventario}
			<div class="brief">
				<p>{eventData?.inventario.descripcion}</p>
			</div>
		{/if}
		<p class="codigo">{eventData?.no_orden}</p>
		<p class="codigo">{eventData?.id_oportunidad}</p>
	{/snippet}
	{#snippet meta()}
		<p>{eventData?.ubicacion_fisica}</p>
		<p>p/u: {eventData?.precio_unitario} USD</p>
		<p>cantidad: {eventData?.cantidad}</p>
		<p>total: {eventData?.precio_unitario * eventData?.cantidad}</p>
	{/snippet}
</ListPreview>

<style>
	.codigo {
		min-width: 15%;
	}
</style>
