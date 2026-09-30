<!-- SelecciónCotizacion.svelte -->
<script lang="ts">
	import { onMount } from 'svelte';
	import SubirCotizacion from '../Documentos/SubirCotizacion.svelte';
	import { fasesPedido } from '$lib';
	import { StoreVenta } from '$lib/stores/pedidos/StorePedidoOportunidad.svelte';
	import { StorePedidoEditar } from '$lib/stores/pedidos/StorePedidoEditar.svelte';
	import { StorePedidoNuevo } from '$lib/stores/pedidos/StorePedidoNuevo.svelte';
	import { StoreContextoRelacion } from '$lib/stores/pedidos/StoreContextoRelacion.svelte';
	import { goto } from '$app/navigation';
	import SubirOcc from '../Documentos/SubirOcc.svelte';

	let { oportunidad } = $props();

	// DATOS DERIVADOS
	let pedidosAgrupados = $derived.by(() => {
		const pedidosFiltrados = oportunidad.pedidos.filter((p) => p.id_cotizacion != null);
		const grupos = pedidosFiltrados.reduce(
			(acc, pedido) => {
				const clave = pedido.id_agrupacion || 'sin_agrupar';

				if (!acc[clave]) {
					acc[clave] = {
						id_agrupacion: clave,
						pedidos: [],
						totalGrupo: 0
					};
				}

				acc[clave].pedidos.push(pedido);
				if (StoreVenta.carrito.some((p) => p.id === pedido.id)) {
					acc[clave].totalGrupo += (pedido.precio_unitario || 0) * (pedido.cantidad || 0);
				}

				return acc;
			},
			{} as Record<
				string,
				{ id_agrupacion: string; pedidos: typeof pedidosFiltrados; totalGrupo: number }
			>
		);

		return Object.values(grupos);
	});

	let pedidoACotizarInvalido = $derived(
		oportunidad.pedidos.some(
			(p) =>
				StoreVenta.carrito.some((item) => item.id === p.id) &&
				(p.precio_unitario === null || p.precio_unitario === undefined || p.precio_unitario === 0)
		)
	);

	let pedidoACotizarInvalidoPorMoneda = $derived(
		oportunidad.pedidos.some((p) => p.moneda == 'USD') &&
			oportunidad.pedidos.some((p) => p.moneda == 'MXN')
	);

	// ESTADOS
	let expandidos = $state<Record<string, boolean>>({});

	// ACCIONES
	function seleccionarPedidoCompleto(id_grupo: string) {
		// Buscamos el elemento dentro del arreglo
		const grupo = pedidosAgrupados.find((g) => g.id_agrupacion === id_grupo);

		if (!grupo) {
			console.warn(`No se encontró el grupo con ID: ${id_grupo}`);
			return;
		}

		console.log(grupo.pedidos);
		StoreVenta.pushLista(grupo.pedidos);
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

	function cambiarEstadoPedido(id: string, nuevoEstado: string) {
		const index = StoreVenta.carrito.findIndex((item) => item.id === id);

		if (nuevoEstado === 'ninguno') {
			// Eliminar del carrito
			if (index !== -1) StoreVenta.carrito.splice(index, 1);
		} else if (nuevoEstado === 'pedido') {
			// Agregar o actualizar a "Sobre Pedido"
			if (index !== -1) {
				StoreVenta.carrito[index].stock = false;
			} else {
				StoreVenta.carrito.push({ id, stock: false });
			}
		} else if (nuevoEstado === 'stock') {
			// Agregar o actualizar a "Stock"
			if (index !== -1) {
				StoreVenta.carrito[index].stock = true;
			} else {
				StoreVenta.carrito.push({ id, stock: true });
			}
		}

		// NOTA: Si necesitas guardar en cookies al cambiar el estado,
		// asegúrate de tener una función expuesta en tu store como StoreVenta.guardar()
	}

	onMount(() => {
		StoreVenta.limpiar();
	});
</script>

{#each pedidosAgrupados as grupo}
	{@const existeSeleccion = StoreVenta.carrito.some((itemCarrito) =>
		grupo.pedidos.some((pedido) => pedido.id === itemCarrito.id)
	)}
	<div class="cotizacion-container">
		<div class="titulo-meta">
			<div class="badge" style={fasesPedido[3]?.estilo}>
				<span>Cotizado</span>
			</div>
			{#if grupo.id_agrupacion !== 'sin_agrupar'}
				<p class="agrupacion-titulo">Grupo: {grupo.id_agrupacion}</p>
			{/if}
		</div>

		<div class="lista-tarjetas">
			<!-- Iteramos sobre los pedidos de este grupo -->
			{#each grupo.pedidos as pedido (pedido.id)}
				{@const itemStore = StoreVenta.carrito.find((item) => item.id === pedido.id)}
				{@const estadoPedido = !itemStore ? 'ninguno' : itemStore.stock ? 'stock' : 'pedido'}
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<div
					class="tarjeta honey"
					class:selected={itemStore}
					class:invalid={itemStore && pedido.precio_unitario == null}
				>
					<strong class="titulo">{pedido.catalogo?.codigo || 'Sin código'}</strong>
					<div class="contenido">
						<span class="precio" class:text-danger={pedido.precio_unitario == null}>
							{pedido.cantidad} x {formatMoneda(pedido.precio_unitario, pedido.moneda)}
						</span>
						<select
							class="select-estado {estadoPedido}"
							value={estadoPedido}
							onchange={(e) => {
								e.stopPropagation();
								cambiarEstadoPedido(pedido.id, e.currentTarget.value);
							}}
							onclick={(e) => {
								e.stopPropagation();
							}}
						>
							<option value="ninguno">Sin seleccionar</option>
							<option value="pedido">Sobre pedido</option>
							<option value="stock">En stock</option>
						</select>
						{#if estadoPedido == 'stock'}
							apartar
						{/if}
					</div>
					<div class="resumen">
						<b class="subtotal">${(pedido.precio_unitario || 0) * (pedido.cantidad || 0)}</b>
					</div>
				</div>
				<!-- Sección Colapsable -->
				{#if pedido.catalogo?.descripcion || pedido.catalogo?.caracteristicas || pedido.observaciones}
					<div class="detalles">
						{#if expandidos[pedido.id]}
							<!-- svelte-ignore a11y_click_events_have_key_events -->
							<!-- svelte-ignore a11y_no_static_element_interactions -->
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
				<hr>
			{/each}

			<!-- Validaciones y Totales POR GRUPO -->
			{#if pedidoACotizarInvalidoPorMoneda}
				<p class="text-danger">No se pueden mezclar USD con MXN</p>
			{:else}
				<div class="total">
					<h1><b>{formatMoneda(grupo.totalGrupo)}</b></h1>
				</div>
			{/if}

			{#if grupo.pedidos.length === 0}
				<p class="estado-vacio">No hay pedidos pendientes por cotizar en este grupo.</p>
			{/if}
		</div>

		<div class="acciones-panel">
			{#if existeSeleccion}
				{#if pedidoACotizarInvalido}
					<button class="alerta-error" onclick={editarPedido}>
						<strong>Atención:</strong> Uno o más pedidos seleccionados no tienen precio unitario. Presiona
						para editar.
					</button>
				{:else}
					<SubirOcc
						tipo="docs_cotizaciones"
						action="/documentos?/subirOcc"
						oportunidad={{
							id: oportunidad?.id,
							cliente: oportunidad?.clientes.nombre_comercial || oportunidad?.clientes.razon_social
						}}
						required
					/>
				{/if}
				<!-- Verificamos si existe al menos un grupo con pedidos para mostrar el botón general -->
			{:else if pedidosAgrupados.length > 0}
				<div class="acciones-fijas">
					<button class="butter" onclick={() => seleccionarPedidoCompleto(grupo.id_agrupacion)}>
						Descartar
					</button>
				</div>
			{/if}
		</div>
	</div>
{/each}

<style>
	.cotizacion-container {
		flex-grow: 1;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding: 16px 16px;
		border: 2px solid;
		border-radius: 32px;
		border-color: var(--color-muted);
	}

	.lista-tarjetas {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}
	.tarjeta {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(var(--e), 1fr));
		border: none;
		align-items: baseline;
		gap: var(--a);
	}
	.titulo-meta {
		display: flex;
		gap: var(--a);
		flex-wrap: wrap;
		align-items: baseline;
		font-size: small;
	}
	.titulo {
		grid-column: span 3;
		display: flex;
		gap: var(--a);
		align-items: baseline;
	}
	.contenido {
		grid-column: span 6;
		display: flex;
		flex-wrap: wrap;
		gap: var(--a);
		align-items: baseline;
	}
	.resumen {
		grid-column: -1 / -2;
		display: flex;
		justify-content: flex-end;
	}
	.total {
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: flex-end;
	}
	.total hr {
		width: 100%;
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
	.acciones-panel {
		margin-top: 0.5rem;
	}

	.acciones-fijas {
		display: flex;
		justify-content: flex-end;
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
