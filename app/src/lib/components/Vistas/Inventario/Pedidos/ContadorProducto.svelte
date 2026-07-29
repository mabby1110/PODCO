<script lang="ts">
	import { StorePedido } from '$lib/stores/StorePedido.svelte';
	import { StorePedidoNuevo } from '$lib/stores/StorePedidoNuevo.svelte';

	let { producto } = $props();
	let cantidad = $derived(
		StorePedidoNuevo.obtenerCantidad(producto.id) + StorePedido.obtenerCantidad(producto.id)
	);

	function agregar(e: Event) {
		console.log('agregar', cantidad);
		e.stopPropagation();
		if (producto.cantidad - cantidad > 0) {
			StorePedidoNuevo.agregar(producto);
		}
	}

	function quitar(e: Event) {
		e.stopPropagation();
		StorePedidoNuevo.quitar(producto);
	}
</script>

{#if cantidad > 0}
	<div class="control-contador">
		<button type="button" class="butter" onclick={quitar} disabled={cantidad === 0}> - </button>

		<span class="cantidad-viva"
			>{StorePedidoNuevo.obtenerCantidad(producto.id)}/{producto.cantidad}</span
		>

		<button type="button" class="butter" onclick={agregar}> + </button>
	</div>
{:else}
	<button class="butter" onclick={agregar}>+</button>
	<p class="header-meta">
		cantidad: {producto?.cantidad}
	</p>
{/if}

<style>
	.control-contador {
		display: inline-flex;
		align-items: center;
	}
	.butter {
		width: var(--d);
	}
	.cantidad-viva {
		min-width: 1.5rem;
		text-align: center;
		font-weight: bold;
	}
</style>
