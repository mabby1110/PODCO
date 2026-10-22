<!-- SelecciónCotizacion.svelte -->
<script lang="ts">
	import { StoreCotizado } from '$lib/stores/pedidos/StorePedidoOportunidad.svelte';
	import { onMount } from 'svelte';
	import SubirCotizacion from '../Documentos/SubirCotizacion.svelte';
	import { fasesPedido } from '$lib';
	import { StorePedidoEditar } from '$lib/stores/pedidos/StorePedidoEditar.svelte';
	import { StorePedidoNuevo } from '$lib/stores/pedidos/StorePedidoNuevo.svelte';
	import { StoreContextoRelacion } from '$lib/stores/pedidos/StoreContextoRelacion.svelte';
	import { goto } from '$app/navigation';

	let {
		oportunidad,
		editando,
		disable
	}: { oportunidad: undefined; editando?: boolean; disable?: boolean } = $props();

	// DATOS DERIVADOS
	let potencial_venta = $derived(oportunidad.pedidos.filter((p) => p.id_cotizacion == null));
	let total = $derived(
		oportunidad.pedidos.reduce(
			(acc, pedido) => acc + (pedido.id_cotizacion ? 0 : pedido.precio_unitario * pedido.cantidad),
			0
		)
	);

	let pedidoACotizarInvalido = $derived(
		oportunidad.pedidos.some(
			(p) =>
				StoreCotizado.carrito.some((item) => item.id === p.id) &&
				(p.precio_unitario === null || p.precio_unitario === undefined || p.precio_unitario === 0)
		)
	);

	let pedidoACotizarInvalidoPorMoneda = $derived(
		oportunidad.pedidos.some((p) => p.moneda == 'USD') &&
			oportunidad.pedidos.some((p) => p.moneda == 'MX')
	);

	// ESTADOS DEL COMPONENTE
	let expandidos = $state<Record<string, boolean>>({});

	// ACCIONES
	function seleccionarPedido(id: string) {
		if (StoreCotizado.carrito.some((item) => item.id === id)) {
			StoreCotizado.pop(id);
		} else {
			StoreCotizado.push(id);
		}
	}

	function seleccionarPedidoCompleto() {
		StoreCotizado.pushLista(potencial_venta);
	}

	// HELPERS
	const formatMoneda = (val: number | null | undefined, moneda: string = 'USD') => {
		if (val == null) return 'Sin precio';
		return new Intl.NumberFormat('es-MX', {
			style: 'currency',
			currency: moneda,
			currencyDisplay: 'narrowSymbol'
		}).format(val);
	};

	async function editarPedido() {
		StorePedidoEditar.limpiar();
		StorePedidoNuevo.limpiar();
		StorePedidoEditar.pushLista(oportunidad.pedidos.filter((p) => p.id_cotizacion == null));
		StoreContextoRelacion.setOportunidad(oportunidad.id);
		await goto('/pedidos');
		StorePedidoEditar.toggleModal(true);
	}

	onMount(() => {
		console.log(oportunidad.pedidos.filter((p) => p.id_cotizacion));
		StoreCotizado.limpiar();
	});
</script>

<div class="pedido">
	<div class="lista-tarjetas honey">
		<div class="badge" style={fasesPedido[2]?.estilo}>
			<span>Potencial de Venta</span>
		</div>
		{#each potencial_venta as pedido (pedido.id)}
			{@const seleccionado = StoreCotizado.carrito.some((item) => item.id === pedido.id)}
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div
				class="tarjeta"
				class:selected={seleccionado}
				class:invalid={seleccionado && pedido.precio_unitario == null}
				onclick={() => seleccionarPedido(pedido.id)}
			>
				<div class="meta">
					<div class="titulo">
						<div class="checkbox" class:checked={seleccionado}></div>
						<strong class="codigo">{pedido.catalogo?.codigo || 'Sin código'}</strong>
					</div>

					<span class="precio" class:text-danger={pedido.precio_unitario == null}>
						{pedido.cantidad} x {formatMoneda(pedido.precio_unitario, pedido.moneda)}
					</span>
				</div>

				<div class="resumen">
					<b class="subtotal">${pedido.precio_unitario * pedido.cantidad}</b>
				</div>

				<!-- Sección Colapsable: Leer Más -->
				{#if pedido.catalogo?.descripcion || pedido.catalogo?.caracteristicas || pedido.observaciones}
					<div class="detalles">
						{#if expandidos[pedido.id]}
							<div class="contenido-expandido" onclick={(e) => e.stopPropagation()}>
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
									<p class="desc">
										<strong>Necesidades:</strong>
										{pedido.oportunidades.necesidades}
									</p>
								{/if}
							</div>
							<button
								class="link-btn"
								onclick={(e) => {
									e.stopPropagation();
									expandidos[pedido.id] = false;
								}}
							>
								Ocultar detalles
							</button>
						{:else}
							<button
								class="link-btn"
								onclick={(e) => {
									e.stopPropagation();
									expandidos[pedido.id] = true;
								}}
							>
								Leer más detalles...
							</button>
						{/if}
					</div>
				{/if}
			</div>
		{/each}
		{#if pedidoACotizarInvalidoPorMoneda}
			<p>no se pueden mezclar USD con MX</p>
		{:else}
			<hr />
			<h1 class="total"><b>{formatMoneda(total)}</b></h1>
		{/if}
		{#if potencial_venta.length === 0}
			<p class="estado-vacio">No hay pedidos pendientes por cotizar en esta oportunidad.</p>
		{/if}
		<div class="acciones-panel">
			{#if !disable}
				{#if StoreCotizado.carrito.length > 0}
					{#if pedidoACotizarInvalido}
						<button class="alerta-error" onclick={editarPedido}>
							<strong>Atención:</strong> Uno o más pedidos seleccionados no tienen precio unitario. Presiona
							para editar.
						</button>
					{:else}
						<SubirCotizacion
							tipo="docs_cotizaciones"
							action="/documentos?/subirCotizacion"
							oportunidad={{
								id: oportunidad?.id,
								cliente:
									oportunidad?.clientes.nombre_comercial || oportunidad?.clientes.razon_social
							}}
							required
						/>
					{/if}
				{:else if potencial_venta.length > 0}
					<div class="acciones-fijas">
						<button class="butter" onclick={editarPedido}>~Editar</button>
						<button class="butter" onclick={seleccionarPedidoCompleto}>
							Seleccionar todo para cotizar
						</button>
					</div>
				{/if}
			{/if}
		</div>
	</div>
</div>

<style>
	.pedido {
		flex-grow: 1;
		display: flex;
		flex-direction: column;
		gap: var(--a);
	}

	.lista-tarjetas {
		display: flex;
		flex-direction: column;
		gap: var(--a);
		padding: var(--a);
	}
	.tarjeta {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
		border: none;
	}
	.tarjeta .meta {
		grid-column: span 2;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
	}
	.tarjeta .meta .titulo {
		grid-column: span 3;
		display: flex;
		gap: var(--a);
	}
	.tarjeta .meta .precio {
		grid-column: span 2;
		display: flex;
		padding-left: 24px;
	}
	.tarjeta .resumen {
		grid-column: -2 / -1;
		display: flex;
		align-items: flex-end;
		justify-content: flex-end;
	}
	.total {
		width: fit-content;
		align-self: flex-end;
	}
	.checkbox {
		width: 16px;
		height: 16px;
		border: 1px solid #cbd5e1;
		border-radius: 4px;
		background: white;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.15s;
	}

	.checkbox.checked {
		border-color: #3b82f6;
		background-color: #3b82f6;
	}

	.checkbox.checked::after {
		content: '';
		width: 4px;
		height: 8px;
		border: solid white;
		border-width: 0 2px 2px 0;
		transform: rotate(45deg);
		margin-bottom: 2px;
	}
	.badge {
		border-radius: 99px;
		background: #f1f5f9;
		height: fit-content;
		padding: 4px 8px;
		text-align: center;
		width: fit-content;
		font-size: small;
	}
	.text-danger {
		color: #ef4444;
	}

	/* Detalles expandibles */
	.detalles {
		margin-top: 0.25rem;
		padding-top: 0.25rem;
		border-top: 1px dashed #cbd5e1;
	}
	.contenido-expandido {
		background: rgba(255, 255, 255, 0.6);
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

	/* Acciones inferiores */
	.acciones-fijas {
		display: flex;
		justify-content: flex-end;
		align-items: flex-end;
		gap: var(--a);
	}

	.alerta-error {
		background: #fef2f2;
		border: 1px solid #fca5a5;
		color: #b91c1c;
		padding: 0.75rem;
		border-radius: 6px;
		font-size: 0.875rem;
		text-align: center;
	}

	.estado-vacio {
		text-align: center;
		color: #94a3b8;
		font-style: italic;
		margin-top: 1rem;
	}
</style>
