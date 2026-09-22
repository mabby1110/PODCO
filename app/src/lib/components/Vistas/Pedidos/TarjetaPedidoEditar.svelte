<!-- VistaEditorPedidos.svelte -->
<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { page } from '$app/state';
	import { fasesPedido } from '$lib';
	import { StoreContextoRelacion } from '$lib/stores/pedidos/StoreContextoRelacion.svelte';
	import { StorePedidoEditar } from '$lib/stores/pedidos/StorePedidoEditar.svelte';
	import { StorePedidoNuevo } from '$lib/stores/pedidos/StorePedidoNuevo.svelte';

	// DATOS DERIVADOS
	let pedidosAEditar = $state(page.data.pedidos);
	let pedidos = $derived(
		pedidosAEditar.filter((p) => StorePedidoEditar.carrito.some((item) => item.id === p.id))
	);
	let productos = $derived(
		StorePedidoNuevo.carrito.map((item) => ({
			...item,
			producto: page.data.catalogo.find((p) => p.id === item.id)
		}))
	);
	let total = $derived(
		pedidos.reduce(
			(acc, pedido) => acc + (pedido.id_cotizacion ? 0 : pedido.precio_unitario * pedido.cantidad),
			0
		)
	);
	let existeRelacionOportunidad = $derived(pedidos.some((p) => p.id_oportunidad != null));
	let idAgrupaciones = $derived([
		...new Set(pedidos.map((pedido) => pedido.id_agrupacion).filter(Boolean))
	]);

	// ESTADOS
	let actualizando = $state(false);
	let mensaje = $state('');
	let expandidos = $state<Record<string, boolean>>({}); // Controla el "leer más" por tarjeta
	let pedidoACotizarInvalidoPorMoneda = $derived(
		pedidos.some((p) => p.moneda == 'USD') && pedidos.some((p) => p.moneda == 'MX')
	);

	// HELPERS
	function actualizarCampo(
		pedidoId: string,
		campo: 'cantidad' | 'moneda' | 'precio_unitario',
		valor: string
	) {
		const pedido = pedidos.find((p) => p.id === pedidoId);
		if (!pedido) return;
		if (campo === 'cantidad' || campo === 'precio_unitario') {
			pedido[campo] = Number(valor);
		} else {
			pedido[campo] = valor;
		}
	}

	// ACCIONES
	async function limpiarCarrito() {
		StorePedidoEditar.limpiar();
		StorePedidoNuevo.limpiar();
		StoreContextoRelacion.limpiar();
	}

	async function editarBorrador() {
		actualizando = true;
		mensaje = '';

		try {
			const tieneOportunidadRelacionada = pedidos.some(
				(pedido) =>
					pedido.id_oportunidad !== null &&
					pedido.id_oportunidad !== StoreContextoRelacion.id_oportunidad
			);

			if (tieneOportunidadRelacionada) {
				const confirmar = window.confirm(
					'Uno o más pedidos tienen una oportunidad relacionada. ¿Estás seguro de que deseas continuar? Esto podría eliminar las relaciones con oportunidades.'
				);
				if (!confirmar) {
					actualizando = false;
					return;
				}
			}

			const formData = new FormData();
			formData.append('pedidosAActualizar', JSON.stringify(pedidos));

			if (idAgrupaciones.length == 1) {
				formData.append('pedidosACrear', JSON.stringify(productos));
			}

			if (StoreContextoRelacion.id_oportunidad) {
				formData.append('idOportunidad', StoreContextoRelacion.id_oportunidad);
			}

			const response = await fetch('/pedidos?/editarBorrador', { method: 'POST', body: formData });
			const result = await response.json();

			if (!response.ok || result?.type === 'failure') {
				throw new Error(result?.data?.error || result?.error || 'Error al actualizar el pedido');
			}

			mensaje = 'Pedido actualizado correctamente';
			const idOportunidad = StoreContextoRelacion.id_oportunidad;

			if (idOportunidad) {
				await goto(`/oportunidades/${idOportunidad}`);
			}
			limpiarCarrito();
			invalidateAll();
		} catch (error) {
			console.error('Error al actualizar pedido:', error);
			mensaje = error instanceof Error ? error.message : 'Error al actualizar el pedido';
		} finally {
			actualizando = false;
		}
	}

	async function eliminarRelacion() {
		const confirmar = window.confirm(
			'¿Estás seguro de que deseas continuar? Esto podría eliminar las relaciones con oportunidades.'
		);
		if (!confirmar) return;

		try {
			const formData = new FormData();
			formData.append('pedidosAActualizar', JSON.stringify(pedidos));

			const response = await fetch('/pedidos?/eliminarRelacion', {
				method: 'POST',
				body: formData
			});
			const result = await response.json();

			if (!response.ok || result?.type === 'failure') {
				throw new Error(result?.data?.error || result?.error || 'Error al actualizar el pedido');
			}

			mensaje = 'Relación eliminada correctamente';
			limpiarCarrito();
			invalidateAll();
		} catch (error) {
			console.error('Error al eliminar relación:', error);
			mensaje = error instanceof Error ? error.message : 'Error al eliminar relación';
		}
	}

	async function eliminarPedido(id_pedido: string) {
		try {
			const formData = new FormData();
			formData.append('id_pedido', id_pedido);

			const response = await fetch('/pedidos?/eliminar', { method: 'POST', body: formData });
			const result = await response.json();

			if (!response.ok || result?.type === 'failure') {
				throw new Error(result?.data?.error || result?.error || 'Error al eliminar el pedido');
			}

			StorePedidoEditar.pop(id_pedido);
			invalidateAll();
			mensaje = 'Pedido eliminado correctamente';
		} catch (error) {
			console.error('Error al eliminar pedido:', error);
			mensaje = error instanceof Error ? error.message : 'Error al eliminar el pedido';
		}
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
</script>

<!-- pedidos a editar -->
{#if StorePedidoEditar.carrito.length > 0}
	<div class="cotizacion-container">
		<div class="badge" style={fasesPedido[2]?.estilo}>
			<span>Potencial de Venta</span>
		</div>
		<div class="lista-tarjetas">
			{#each pedidos as pedido (pedido.id)}
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<div class="tarjeta">
					<div class="meta">
						<div class="titulo">
							<button class="butter tiny" onclick={() => StorePedidoEditar.pop(pedido.id)}>✕</button
							>
							<div>
								<strong class="codigo">{pedido.catalogo?.codigo || 'Sin código'}</strong>
								<div class="row enlaces">
									{#if pedido.id_oportunidad}
										<a
											href="/oportunidades/{pedido.id_oportunidad}"
											onclick={(e) => e.stopPropagation()}
										>
											Op {pedido.oportunidades?.clientes?.razon_social ||
												pedido.oportunidades?.clientes?.nombre_comercial}
										</a>
									{/if}
								</div>
							</div>
						</div>

						<span class="inputs" class:text-danger={pedido.precio_unitario == null}>
							<label class="input-group">
								<span class="label-text">Cantidad</span>
								<input
									type="number"
									min="0"
									step="1"
									class="input-sm"
									bind:value={pedido.cantidad}
								/>
							</label>

							<label class="input-group">
								<span class="label-text">Precio unitario</span>
								<input
									type="number"
									min="0"
									step="0.01"
									class="input-sm"
									bind:value={pedido.precio_unitario}
								/>
							</label>
							<label class="input-group">
								<span class="label-text">Moneda</span>
								<select class="select-sm" bind:value={pedido.moneda}>
									<option value="MXN">MXN</option>
									<option value="USD">USD</option>
								</select>
							</label>
						</span>

						<div class="butter resumen">
							<b class="subtotal">${pedido.precio_unitario * pedido.cantidad}</b>
						</div>
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
			<hr />
			{#if pedidoACotizarInvalidoPorMoneda}
				<p>no se pueden mezclar USD con MX</p>
			{:else}
				<h1 class="total"><b>{formatMoneda(total)}</b></h1>
			{/if}
		</div>
	</div>
{:else}
	<p class="estado-vacio">No hay pedidos seleccionados</p>
	<button class="butter agregar-producto" onclick={() => goto('/pedidos')}>+Agregar Pedido</button>
{/if}

<!-- pedidos nuevos -->
{StorePedidoNuevo.carrito.length}
{#if StorePedidoNuevo.carrito.length > 0}
	<div class="cotizacion-container">
		<div class="editor-container">
			<!-- PEDIDOS A CREAR (NUEVOS) -->
			<div class="nuevos-container">
				<h4 class="title-nuevos">Nuevos a agregar:</h4>
				{#each productos as producto}
					<div class="card mini-card row justify-between">
						<span class="codigo">{producto.producto.codigo}</span>
						<div class="stepper">
							<button class="btn-step" onclick={() => StorePedidoNuevo.pop(producto.id)}>-</button>
							<span class="valor-step">{producto.cantidad}</span>
							<button class="btn-step" onclick={() => StorePedidoNuevo.push(producto.id)}>+</button>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
{:else}
	<p class="estado-vacio">No hay productos seleccionados</p>
{/if}

<button class="butter agregar-producto" onclick={() => goto('/catalogo')}>+Agregar producto</button>

<!-- ACCIONES GLOBALES -->
<div class="acciones-fijas">
	<button class="butter variant-outline" onclick={limpiarCarrito}>Limpiar</button>
	{#if existeRelacionOportunidad}
		<button class="butter variant-danger" onclick={eliminarRelacion}>Desvincular Oportunidad</button
		>
	{/if}
	<button class="butter variant-primary" onclick={editarBorrador} disabled={actualizando}>
		{actualizando ? 'Actualizando...' : 'Guardar Cambios'}
	</button>
</div>

<style>
	.cotizacion-container {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding: 16px 16px;
		border: 2px solid;
		border-radius: 32px;
		border-color: var(--color-muted);
		background-color: var(--color-background);
	}

	.lista-tarjetas {
		display: flex;
		flex-direction: column;
		gap: var(--c);
	}
	.tarjeta {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
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
		align-items: baseline;
	}
	.tarjeta .meta .inputs {
		grid-column: span 3;
		display: flex;
		padding-left: 32px;
		gap: var(--y);
	}
	.input-group input {
		width: 100%;
	}
	.label-text {
		font-size: small;
	}
	.tarjeta .resumen {
		grid-column: -2 / -1;
		display: flex;
		align-items: flex-end;
		justify-content: flex-end;
		border: none;
		justify-self: flex-end;
		align-self: last baseline;
	}
	.total {
		width: fit-content;
		align-self: flex-end;
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
	.agregar-producto {
		border: 1px dashed var(--color-secondary);
		background-color: transparent;
		align-self: center;
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
		padding-top: var(--e);
		gap: var(--y);
	}

	.estado-vacio {
		text-align: center;
		color: #94a3b8;
		font-style: italic;
		margin-top: 1rem;
	}
</style>
