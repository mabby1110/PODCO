<!-- PedidoCard.svelte -->
<script lang="ts">
	import { fasesPedido } from '$lib';
	import { StorePedidoEditar } from '$lib/stores/pedidos/StorePedidoEditar.svelte';

	let { pedido, disable = false } = $props();

	// Estado para expandir descripción y características
	let expandido = $state(false);

	function editarPedido() {
		if (disable) return;
		StorePedidoEditar.push(pedido.id);
		StorePedidoEditar.toggleModal(true);
	}

	// Helpers de formateo
	const formatMoneda = (val: number, moneda: string) =>
		new Intl.NumberFormat('es-MX', { style: 'currency', currency: moneda }).format(val);

	const formatFecha = (iso: string) =>
		new Intl.DateTimeFormat('es-MX', { dateStyle: 'short' }).format(new Date(iso));
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="card" onclick={editarPedido} class:disabled={disable}>
	<!-- Fila 1: Catálogo y fase -->
	<header class="row justify-between">
		<strong class="codigo">{pedido.catalogo?.codigo || 'Sin código'}</strong>
		<span class="badge" style={fasesPedido[pedido.fase].estilo}
			>{fasesPedido[pedido.fase].actual}</span
		>
	</header>

	<!-- Fila 2: Metadatos principales -->
	<div class="row info-principal">
		<span class="precio">
			{pedido.cantidad} x {formatMoneda(pedido.precio_unitario, pedido.moneda)}
		</span>
	</div>

	<!-- Fila 3: Enlaces de referencias -->
	<div class="row enlaces">
		<span class="fecha">{formatFecha(pedido.fecha_creacion)}</span>
		<!-- Se usa stopPropagation para no disparar el modo edición al hacer clic en el link -->
		{#if pedido.id_oportunidad}
			<span class="separador">•</span>
			<a href="/oportunidades/{pedido.id_oportunidad}" onclick={(e) => e.stopPropagation()}>
				Op: {pedido.id_oportunidad.split('-').pop()}
			</a>
		{/if}
		{#if pedido.oportunidades?.id_cliente}
			<span class="separador">•</span>
			<a href="/clientes/{pedido.oportunidades?.id_cliente}" onclick={(e) => e.stopPropagation()}>
				Cli: {pedido.oportunidades?.clientes?.razon_social ||
					pedido.oportunidades?.id_cliente.split('-').pop()}
			</a>
		{/if}
	</div>

	<!-- Sección Colapsable: Leer Más -->
	{#if pedido.catalogo?.descripcion || pedido.catalogo?.caracteristicas}
		<div class="detalles">
			{#if expandido}
				<div class="contenido-expandido">
					{#if pedido.catalogo.descripcion}
						<p class="desc"><strong>Desc:</strong> {pedido.catalogo.descripcion}</p>
					{/if}
					{#if pedido.catalogo.caracteristicas}
						<div class="jsonb">
							<strong>Características:</strong>
							<pre>{JSON.stringify(pedido.catalogo.caracteristicas, null, 2)}</pre>
						</div>
					{/if}
					{#if pedido.oportunidades?.necesidades}
						<p class="desc"><strong>Necesidades:</strong> {pedido.oportunidades.necesidades}</p>
					{/if}

					<div class="row motivo truncate">
						<small>{pedido.oportunidades?.motivo} | Fase {pedido.oportunidades?.fase}</small>
					</div>
				</div>
				<button
					class="link-btn"
					onclick={(e) => {
						e.stopPropagation();
						expandido = false;
					}}
				>
					Ocultar detalles
				</button>
			{:else}
				<button
					class="link-btn"
					onclick={(e) => {
						e.stopPropagation();
						expandido = true;
					}}
				>
					Leer más detalles...
				</button>
			{/if}
		</div>
	{/if}
</div>

<style>
	.card {
		background: #ffffff;
		border: 1px solid #e2e8f0;
		border-radius: 6px;
		padding: 0.75rem 1rem;
		font-size: 0.875rem;
		color: #334155;
		cursor: pointer;
		transition:
			border-color 0.2s,
			box-shadow 0.2s;
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}

	.card:hover:not(.disabled) {
		border-color: #94a3b8;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
	}

	.card.disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}

	.row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.justify-between {
		justify-content: space-between;
	}

	.codigo {
		font-size: 0.95rem;
		color: #0f172a;
	}

	.badge {
		font-size: 0.7rem;
		padding: 0.1rem 0.4rem;
		border-radius: 99px;
		background: #f1f5f9;
		font-weight: 600;
	}

	.info-principal {
		color: #475569;
	}

	.precio {
		font-weight: 500;
		color: #059669; /* Verde para destacar valor */
	}

	.enlaces a {
		color: #2563eb;
		text-decoration: none;
		font-weight: 500;
	}

	.enlaces a:hover {
		text-decoration: underline;
	}

	.separador {
		color: #cbd5e1;
	}

	.truncate {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		display: block;
	}

	.motivo {
		color: #64748b;
	}

	.detalles {
		margin-top: 0.25rem;
		padding-top: 0.25rem;
		border-top: 1px dashed #e2e8f0;
	}

	.contenido-expandido {
		background: #f8fafc;
		padding: 0.5rem;
		border-radius: 4px;
		margin-bottom: 0.5rem;
	}

	.desc {
		margin: 0 0 0.4rem 0;
		font-size: 0.8rem;
	}

	.jsonb pre {
		margin: 0;
		font-size: 0.75rem;
		white-space: pre-wrap;
		color: #475569;
	}

	.link-btn {
		background: none;
		border: none;
		color: #3b82f6;
		font-size: 0.8rem;
		padding: 0;
		cursor: pointer;
		text-decoration: underline;
	}
</style>
