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

	async function eliminar(item: any) {
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

	async function descartar(item: any) {
		const formData = new FormData();
		formData.append('pedidosAActualizar', JSON.stringify([{ id: item.id, estatus: 'descartado' }]));
		const response = await fetch('/pedidos?/updatePedido', {
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
			const { agentes, inventario, oportunidades, docs_cotizaciones, ...pedidoAActualizar } = item;
			pedidoAActualizar.cantidad = item.cantidad;
			pedidoAActualizar.precio_unitario = item.precio_unitario;
			pedidoAActualizar.estatus = item.estatus;
			pedidoAActualizar.id_oportunidad = item.id_oportunidad;

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
	<div class="descripcion">
		{#if hot}
			<div class="acciones">
				<button type="button" class="butter milk" onclick={() => eliminar(item)}>✕</button>
				<input
					class="descartar"
					type="checkbox"
					checked={item.estatus === 'seleccionado'}
					onchange={(e) => {
						item.estatus = e.currentTarget.checked ? 'seleccionado' : 'descartado';
						guardarItem();
					}}
				/>
			</div>
		{:else if cold}
			<div class="acciones">
				<button type="button" class="butter milk" onclick={() => descartar(item)}>✕</button>
			</div>
		{/if}
		<span
			class="chip"
			class:seleccionado={item.estatus === 'seleccionado'}
			class:cotizado={item.estatus === 'cotizado'}>{item.estatus}</span
		>
		<b class="titulo">{item.inventario?.descripcion || '-'}</b>
		<div class="meta">
			<span>{item.inventario?.serie || item.inventario?.codigo || 'sin código'}</span>
			<p>{datos_relacionados?.agente}</p>
			<a href="/oportunidades/{item.id_oportunidad}">{datos_relacionados.cliente}</a>
		</div>
	</div>

	<div class="editable">
		<div class="celda cantidad">
			<span class="label">Cant.</span>
			{#if editando}
				<input class="input-num" type="number" bind:value={item.cantidad} min="1" />
			{:else}
				<span>{item.cantidad || 0}</span>
			{/if}
		</div>

		<div class="celda precio">
			<span class="label">Precio (USD)</span>
			{#if editando}
				<div class="wrapper-precio">
					<span>$</span>
					<input class="input-num" type="number" bind:value={item.precio_unitario} step="0.01" />
				</div>
			{:else}
				<span>${item.precio_unitario || 0}</span>
			{/if}
		</div>
	</div>

	<div class="total">
		<span class="label">Total</span>
		<h3 class="valor-total">{total}</h3>
	</div>
</div>

<style>
	.pedido {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: var(--a);
		border-bottom: 1px dashed var(--color-muted);
		margin-bottom: var(--a);
		padding-bottom: var(--a);
	}
	.acciones {
		display: flex;
		pointer-events: all;
	}
	.descripcion {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: var(--a);
	}
	.descripcion .titulo {
		min-width: 70%;
	}
	.editable {
		display: flex;
		flex-wrap: wrap;
		gap: var(--a);
		flex-grow: 1;
        pointer-events: all;
	}
	.label {
		display: block;
		font-size: smaller;
		font-weight: lighter;
		color: var(--color-muted);
	}
	.celda {
		display: flex;
		flex-direction: column;
	}
	.cantidad {
		width: var(--e);
	}
	.total {
		flex-grow: 1;
		display: flex;
		flex-direction: column;
		align-items: flex-end;
	}
	.meta {
		display: flex;
		gap: var(--a);
	}
	.seleccionado {
		background-color: var(--color-2);
	}
	.cotizado {
		background-color: var(--color-3);
	}
</style>
