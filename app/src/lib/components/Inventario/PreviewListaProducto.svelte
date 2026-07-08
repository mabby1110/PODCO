<script lang="ts">
	import ListPreview from '../ListPreview.svelte';
	import ContadorProducto from './ContadorProducto.svelte';
	let { event } = $props();
</script>

<ListPreview style={event?.style} ocultarAcciones>
	{#snippet header()}
		{#if event?.descripcion}
			<div class="brief">
				<h3>{event?.descripcion}</h3>
			</div>
		{/if}
		<p class="tiny">{event?.serie || event?.codigo}</p>
	{/snippet}
	{#snippet meta()}
		<p>{event?.ubicacion_fisica}</p>
		<p>{event?.categorias}</p>
		<p>cantidad: {event?.cantidad}</p>
	{/snippet}

	<!-- {#snippet acciones()}
		<ContadorProducto producto={eventData} />
	{/snippet} -->
</ListPreview>
