<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { StorePedido } from '$lib/stores/StorePedido.svelte';
	import { StorePedidoNuevo } from '$lib/stores/StorePedidoNuevo.svelte';

	let { pedido } = $props();

	let cantidad = $derived(
		StorePedidoNuevo.obtenerCantidad(pedido.inventario.id) +
			StorePedido.obtenerCantidad(pedido.inventario.id)
	);

	function agregar(e: Event) {
		e.stopPropagation();
		if (pedido.inventario.cantidad - cantidad > 0) {
			StorePedido.agregar(pedido);
		}
	}
	
	async function quitar(e: Event) {
		e.stopPropagation();

		if (cantidad > 1) {
			StorePedido.quitar(pedido);
		} else {
			const confirmado = confirm('¿Confirmas que deseas borrar este pedido?');

			if (confirmado) {
				const formData = new FormData();
				formData.append('id', pedido.id);

				const response = await fetch('inventario?/deletePedido', {
					method: 'POST',
					body: formData
				});

				if (response.ok) {
					StorePedido.quitar(pedido);
					await invalidateAll();
				}
			}
		}
	}
</script>

{cantidad}
{cantidad > 0}
<div class="control-contador">
	<button type="button" class="butter" onclick={quitar} disabled={pedido.cantidad == 0}> - </button>
	<span class="cantidad-viva"
		>{StorePedido.obtenerCantidad(pedido.inventario.id)}/{pedido.inventario.cantidad}</span
	>

	<button type="button" class="butter" onclick={agregar}> + </button>
</div>

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
