<script lang="ts">
	import { invalidate, invalidateAll } from '$app/navigation';
	import { StoreEditarPedido } from '$lib/stores/StoreEditarPedido.svelte';
	import { formatCurrency } from '$lib/utils/util';

	// Definimos los pasos por defecto usando las variables y colores que proporcionaste.
	// Al usar $props(), permitimos que este array sea sobreescrito si lo necesitas en el futuro.
	let { item, selected }: { item: any; selected?: boolean } = $props();
	async function removerItem(item: any) {
		if (item.id_oportunidad) {
			item.id_oportunidad = null;

			const formData = new FormData();
			const pedidosAActualizar = [
				{
					id: item.id,
					id_oportunidad: item.id_oportunidad
				}
			];
			formData.append('pedidosAActualizar', JSON.stringify(pedidosAActualizar));

			const response = await fetch('/inventario?/updatePedido', {
				method: 'POST',
				body: formData
			});

			if (response.ok) {
				StoreEditarPedido.remover(item);
				invalidateAll();
			} else {
				console.error('Error en la acción de SvelteKit');
			}
		} else {
			StoreEditarPedido.remover(item);
		}
	}
</script>

<div class="leyenda">
	<div class="pedido">
		{#if !selected}
			<button type="button" class="butter milk" onclick={() => removerItem(item)}>✕</button>
		{/if}
		<div class="descripcion">
			<b>{item.inventario.descripcion || '-'}</b>
			<a href="/oportunidades/{item.id_oportunidad}">{item.id_oportunidad}</a>
		</div>
		<span class="codigo">{item.inventario.serie || item.inventario.codigo || 'sin código'}</span>
		<span>{item.cantidad}</span>
		<span><p>${item.precio_unitario || 0}</p></span>
		<span>USD</span>
		<span class="total">{formatCurrency(String(item.precio_unitario * item.cantidad), 'USD')}</span>
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
		grid-column: span 3;
		word-break: break-all;
		justify-self: flex-start;
	}
	.pedido .total {
		grid-column: span 2;
		word-break: break-all;
	}
</style>
