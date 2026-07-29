<script lang="ts">
	import { StoreEditarPedido } from '$lib/stores/StoreEditarPedido.svelte';
	import { formatCurrency } from '$lib/utils/util';

	// Definimos los pasos por defecto usando las variables y colores que proporcionaste.
	// Al usar $props(), permitimos que este array sea sobreescrito si lo necesitas en el futuro.
	let { item } = $props();
	function removerItem(item: any) {
		// Ajustar la propiedad identificadora según la implementación del Store
		StoreEditarPedido.remover(item);
	}
</script>

<div class="leyenda">
	<div class="pedido">
		<div class="descripcion">
			<b>{item.inventario.descripcion || '-'}</b>
			<a href="/oportunidades/{item.id_oportunidad}">{item.id_oportunidad}</a>
		</div>
		<span class="codigo">{item.inventario.serie || item.inventario.codigo || 'sin código'}</span>
		<span>{item.cantidad}</span>
		<span><p>${item.precio_unitario || 0}</p></span>
		<span>USD</span>
		<span class="total">{formatCurrency(String(item.precio_unitario * item.cantidad), 'USD')}</span>
		<button type="button" class="btn-remover" onclick={() => removerItem(item)}>X</button>
	</div>
</div>

<style>
	.pedido {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(var(--d), 1fr));
		gap: var(--a);
		align-items: baseline;
		padding: 4px;
		justify-items: center;
	}
	.pedido .descripcion {
		grid-column: span 5;
		word-break: break-all;
		justify-self: flex-start;
		display: flex;
		flex-direction: column;
	}
	.pedido .codigo {
		grid-column: span 2;
		word-break: break-all;
		justify-self: flex-start;
	}
	.pedido .total {
		grid-column: span 2;
		word-break: break-all;
	}
</style>
