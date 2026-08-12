<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { StoreEditarPedido } from '$lib/stores/StoreEditarPedido.svelte';
	import { StorePedido } from '$lib/stores/StorePedido.svelte';
	import { formatCurrency } from '$lib/utils/util';

	let {
		item,
		editando,
		hot,
		cold
	}: { item: any; editando?: boolean; hot?: boolean; cold?: boolean } = $props();
	
	let total = $derived(
		formatCurrency(String((item.precio_unitario || 0) * (item.cantidad || 0)), 'USD')
	);
	let isSubmitting = $state(false);
	let datos_relacionados = $derived({
		cliente:
			item.oportunidades?.clientes.razon_social || item.oportunidades?.clientes.nombre_comercial,
		agente: item.agentes?.nombre
	});
	async function removerItem(item: any) {
		if (item.id_oportunidad) {
			const formData = new FormData();
			formData.append(
				'pedidosAActualizar',
				JSON.stringify([{ id: item.id, id_oportunidad: null }])
			);
			const response = await fetch('/pedidos?/updatePedido', {
				method: 'POST',
				body: formData
			});

			if (response.ok) {
				item.id_oportunidad = null;
				StoreEditarPedido.remover(item);
				invalidateAll();
			}
		} else {
			StoreEditarPedido.remover(item);
		}
	}
	async function eliminarItem(item: any) {
		const formData = new FormData();
		formData.append('id', item.id);
		const response = await fetch('/pedidos?/deletePedido', {
			method: 'POST',
			body: formData
		});

		if (response.ok) {
			item.id_oportunidad = null;
			StoreEditarPedido.eliminar(item);
			StorePedido.eliminar(item);
			invalidateAll();
		}
	}

	async function guardarItem() {
		isSubmitting = true;
		try {
			const formData = new FormData();
			const { agente, inventario, ...pedidoAActualizar } = item;
			pedidoAActualizar.cantidad = item.cantidad;
			pedidoAActualizar.precio_unitario = item.precio_unitario;
			formData.append('pedidosAActualizar', JSON.stringify([pedidoAActualizar]));

			const response = await fetch('/pedidos?/updatePedido', {
				method: 'POST',
				body: formData
			});

			if (response.ok) invalidateAll();
		} finally {
			isSubmitting = false;
		}
	}
</script>

<div class="pedido">
	{#if editando}
		{#if hot}
			<button type="button" class="butter milk" onclick={() => removerItem(item)}>✕</button>
		{:else if cold}
			<button type="button" class="butter milk" onclick={() => eliminarItem(item)}>✕</button>
		{:else}
			<button type="button" class="butter milk" onclick={() => StoreEditarPedido.remover(item)}
				>✕</button
			>
		{/if}

		<div class="descripcion">
			<b>{item.inventario?.descripcion || '-'}</b>
			<div class="meta">
				<p>{datos_relacionados?.agente}</p>
				<a href="/oportunidades/{item.id_oportunidad}">{datos_relacionados.cliente}</a>
			</div>
		</div>
		<span class="codigo">{item.inventario?.serie || item.inventario?.codigo || 'sin código'}</span>

		<input class="cantidad" type="number" bind:value={item.cantidad} min="1" />
		<div class="precio">
			$<input type="number" bind:value={item.precio_unitario} step="0.01" />
		</div>
	{:else}
		<div class="descripcion">
			<b>{item.inventario?.descripcion || '-'}</b>
			<div class="meta">
				<p>{datos_relacionados?.agente}</p>
				<a href="/oportunidades/{item.id_oportunidad}">{datos_relacionados.cliente}</a>
			</div>
		</div>
		<span class="codigo">{item.inventario?.serie || item.inventario?.codigo || 'sin código'}</span>
		<span class="precio">{item.cantidad || 0}</span>
		<span class="precio"><p>${item.precio_unitario || 0}</p></span>
	{/if}

	<span>USD</span>
	<span class="total">{total}</span>
	{#if hot && editando}
		<button type="button" class="butter matcha submit" disabled={isSubmitting} onclick={guardarItem}
			>Guardar</button
		>
	{/if}
</div>

<style>
	.pedido {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(var(--d), 1fr));
		gap: var(--a);
		align-items: center;
		padding: 4px;
		cursor: pointer;
		pointer-events: all;
	}
	.pedido .descripcion {
		grid-column: span 6;
		word-break: break-word;
		display: flex;
		flex-direction: column;
		justify-self: flex-start;
		align-items: flex-start;
		text-align: start;
	}
	.pedido .descripcion .meta {
		display: flex;
		gap: var(--a);
	}
	.pedido .codigo {
		grid-column: span 3;
		word-break: break-word;
		justify-self: flex-start;
	}
	.pedido .precio,
	.pedido .total {
		grid-column: span 3;
		display: flex;
		align-items: baseline;
		gap: var(--a);
	}
	.pedido .cantidad {
		grid-column: span 2;
	}
	.pedido .submit {
		grid-column: span 2;
		justify-self: flex-end;
	}
	.pedido input {
		width: 100%;
	}
</style>
