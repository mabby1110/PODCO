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

{item.estatus}
<div class="pedido">
	<div class="celda acciones">
		{#if hot}
			<div class="acciones-hot">
				<button type="button" class="butter milk" onclick={() => eliminar(item)}>✕</button>
				<input
					class="descartar"
					type="checkbox"
					checked={item.estatus === 'aprobado'}
					onchange={(e) => {
						item.estatus = e.currentTarget.checked ? 'aprobado' : 'descartado';
						guardarItem();
					}}
				/>
			</div>
		{:else if cold}
			<button type="button" class="butter milk" onclick={() => descartar(item)}>✕</button>
		{/if}
	</div>

	<div class="celda descripcion">
		<span class="label">Descripción</span>
		<b>{item.inventario?.descripcion || '-'}</b>
		<div class="meta">
			<p>{datos_relacionados?.agente}</p>
			<a href="/oportunidades/{item.id_oportunidad}">{datos_relacionados.cliente}</a>
		</div>
	</div>

	<div class="celda codigo">
		<span class="label">Código</span>
		<span>{item.inventario?.serie || item.inventario?.codigo || 'sin código'}</span>
	</div>

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

	<div class="celda total">
		<span class="label">Total</span>
		<span class="valor-total">{total}</span>
	</div>
</div>

<style>
	.pedido {
		display: grid;
		grid-template-columns: min-content 3fr 2fr 1fr 1.5fr 1.5fr;
		gap: var(--a, 12px);
		padding: 8px;
		align-items: start;
		border-bottom: 1px solid rgba(0, 0, 0, 0.1);
	}
    .pedido input, .butter {
        pointer-events: all;
    }

	/* Grid responsivo */
	@media (max-width: 768px) {
		.pedido {
			grid-template-columns: 1fr 1fr;
		}
		.acciones {
			grid-column: span 2;
			flex-direction: row;
			justify-content: flex-end;
		}
		.descripcion {
			grid-column: span 2;
		}
	}

	.celda {
		display: flex;
		flex-direction: column;
		gap: 4px;
		word-break: break-word;
	}

	.label {
		font-size: 0.65rem;
		text-transform: uppercase;
		font-weight: 700;
		letter-spacing: 0.5px;
		color: var(--color-muted);
	}

	.descripcion .meta {
		display: flex;
		gap: var(--a, 8px);
		font-size: 0.8rem;
		color: #555;
	}

	.acciones-hot {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
	}

	.descartar {
		width: var(--b, 16px) !important;
		cursor: pointer;
	}

	.wrapper-precio {
		display: flex;
		align-items: center;
		gap: 4px;
	}

	.input-num {
		width: 100%;
		min-width: 60px;
		padding: 4px;
	}

	.valor-total {
		font-weight: bold;
	}
</style>
