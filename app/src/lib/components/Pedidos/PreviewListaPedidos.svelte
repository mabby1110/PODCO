<script lang="ts">
	import { formatCurrency } from '$lib/utils/util';
	import EditarCantidadPedido from './EditarCantidadPedido.svelte';
	import ContadorProducto from './ContadorProducto.svelte';
	import { StorePedidoNuevo } from '$lib/stores/StorePedidoNuevo.svelte';
	import { StorePedido } from '$lib/stores/StorePedido.svelte';

	let {
		item,
		isEdicion = false
	}: {
		item: any;
		isEdicion?: boolean;
	} = $props();

	// Calculamos el estado del stock dinámicamente si es un producto nuevo
	let sinStock = $derived(
		!isEdicion
			? StorePedidoNuevo.obtenerCantidad(item.id) + StorePedido.obtenerCantidad(item.id) >=
					item.producto.cantidad
			: false
	);
</script>

<div class="producto">
	{#if isEdicion}
		<b class="descripcion">{item.pedido.inventario.descripcion || '-'}</b>
		<span class="codigo"
			>{item.pedido.inventario.serie || item.pedido.inventario.codigo || 'sin código'}</span
		>
		<span class="stock">
			<input type="checkbox" disabled checked={item.pedido.stock} />
		</span>
		<span class="cantidad">
			<EditarCantidadPedido pedido={item.pedido} />
		</span>
		<span class="cantidad">
			<input type="number" name="total" bind:value={item.pedido.precio_unitario} />
		</span>
		<span>USD</span>
		<span class="total">
			{formatCurrency(String(item.pedido.precio_unitario * item.pedido.cantidad), 'USD')}
		</span>
	{:else}
		<b class="descripcion">{item.producto.descripcion || '-'}</b>
		<span class="codigo">{item.producto.serie || item.producto.codigo || 'sin código'}</span>
		<span class="stock">
			<input
				type="checkbox"
				checked={sinStock ? false : item.stock}
				disabled={sinStock}
				onchange={(e) => {
					item.stock = e.currentTarget.checked;
					item.piezas = item.stock ? 0 : 1;
				}}
			/>
		</span>
		<span class="cantidad">
			{#if item.stock}
				<ContadorProducto producto={item.producto} />
			{:else}
				<input type="number" bind:value={item.piezas} min="1" />
			{/if}
		</span>
		<span class="cantidad">
			<input type="number" name="total" bind:value={item.producto.precio} />
		</span>
		<span>USD</span>
		<span class="total">
			{formatCurrency(String(item.producto.precio * item.piezas), 'USD')}
		</span>
	{/if}
</div>

<style>
	.producto {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(35px, 1fr));
		gap: var(--a);
		align-items: baseline;
		justify-items: center;
	}
	.producto .descripcion {
		grid-column: span 6;
		word-break: break-all;
		justify-self: flex-start;
	}
	.producto .codigo {
		grid-column: span 3;
		word-break: break-all;
		justify-self: flex-start;
	}
	.producto .cantidad,
	.producto .total {
		grid-column: span 2;
		word-break: break-all;
	}
	.stock {
		align-self: center;
	}
	input {
		width: 100%;
	}
</style>
