<script lang="ts">
	import ListPreview from '../ListPreview.svelte';
	import ContadorProducto from './ContadorProducto.svelte';
	let { event } = $props();

	const eventData = $derived.by(() => {
		if (!event) return null;
		return {
			...event
		};
	});
</script>

<ListPreview style={eventData?.style} ocultarAcciones>
	{#snippet header()}
		<p class="codigo">{eventData?.serie || eventData?.codigo}</p>
		{#if eventData?.descripcion}
			<div class="brief">
				<h3>{eventData?.descripcion}</h3>
			</div>
		{/if}
	{/snippet}
	{#snippet meta()}
		<p>{eventData?.ubicacion_fisica}</p>
		<p>{eventData?.categorias}</p>
		<p>cantidad: {eventData?.cantidad}</p>
	{/snippet}
	{#snippet acciones()}
		<ContadorProducto producto={eventData} />
	{/snippet}
</ListPreview>

<style>
	.codigo {
		min-width: 15%;
	}
</style>
