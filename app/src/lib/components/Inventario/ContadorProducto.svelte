<script lang="ts">
	import { productosSeleccionadosStore } from '$lib/stores/productosSeleccionadosStore.svelte';

	let { producto } = $props();
	let cantidad = $derived(productosSeleccionadosStore.obtenerCantidad(producto.id));
	console.log('contador: ', cantidad);
</script>

<div class="control-contador">
	<button
		type="button"
		class="butter"
		onclick={() => productosSeleccionadosStore.quitar(producto)}
		disabled={cantidad === 0}
	>
		-
	</button>

	<span class="cantidad-viva">{cantidad}/{producto.cantidad}</span>

	<button
		type="button"
		class="butter"
		onclick={() => productosSeleccionadosStore.agregar(producto)}
	>
		+
	</button>
</div>

<style>
	.control-contador {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
	}
	.butter {
		height: fit-content;
		width: var(--d);
	}
	.cantidad-viva {
		min-width: 1.5rem;
		text-align: center;
		font-weight: bold;
	}
</style>
