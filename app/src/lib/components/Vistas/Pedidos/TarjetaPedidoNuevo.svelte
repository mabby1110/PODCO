<script lang="ts">
	import { StorePedido } from '$lib/stores/StorePedido.svelte';
	import { StorePedidoNuevo } from '$lib/stores/StorePedidoNuevo.svelte';
	import { formatCurrency } from '$lib/utils/util';

	let {
		item = $bindable()
	}: {
		item: any;
	} = $props();

	let total = $derived(formatCurrency(String(item.producto.precio * item.piezas), 'USD')||'$0');
</script>

<div class="pedido">
	<div class="encabezado">
		<button type="button" class="butter milk" onclick={() => StorePedidoNuevo.quitar(item.producto)}>✕</button>

		<b class="titulo">{item.producto.descripcion || '-'}</b>
		<div class="meta">
			<span class="codigo">{item.producto.serie || item.producto.codigo || 'sin código'}</span>`
		</div>
	</div>

	<div class="descripcion">
		<div class="celda cantidad">
			<span class="label">Cantidad</span>

			<input type="number" bind:value={item.piezas} min="1" />
		</div>

		<div class="celda precio">
			<span class="label">Precio (USD)</span>
			<div class="wrapper-precio">
				<input type="number" name="total" bind:value={item.producto.precio} />
			</div>
		</div>
		<div class="total">
			<span class="label">Total</span>
			<h3 class="valor-total">{total}</h3>
		</div>
	</div>
</div>
<style>
	.pedido {
		display: flex;
		flex-wrap: wrap;
		pointer-events: all;
		border-bottom: 1px dashed var(--color-muted);
		padding: var(--a);
	}
	.encabezado {
		max-width: 70vw;
		width: 100%;
		display: flex;
		flex-wrap: wrap;
		gap: 0 var(--a);
		align-items: center;
	}
	.encabezado .meta {
		display: flex;
		flex-wrap: wrap;
		gap: 0 var(--a);
		width: 100%;
	}
	.descripcion {
		flex-grow: 1;
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: 0 var(--b);
	}
	.descripcion .celda {
		min-width: var(--d);
		display: flex;
		flex-direction: column;
	}
	.descripcion .celda input {
		width: 100%;
	}
	.label {
		font-weight: lighter;
		font-size: smaller;
	}
</style>

