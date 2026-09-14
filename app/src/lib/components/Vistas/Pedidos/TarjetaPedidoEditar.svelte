<!-- VistaEditorPedidos.svelte -->
<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { page } from '$app/state';
	import { fasesPedido } from '$lib';
	import { StoreContextoRelacion } from '$lib/stores/pedidos/StoreContextoRelacion.svelte';
	import { StorePedidoEditar } from '$lib/stores/pedidos/StorePedidoEditar.svelte';
	import { StorePedidoNuevo } from '$lib/stores/pedidos/StorePedidoNuevo.svelte';

	// DATOS DERIVADOS
	let pedidos = $derived(
		page.data.pedidos.filter((p) => StorePedidoEditar.carrito.some((item) => item.id === p.id))
	);
	let productos = $derived(
		StorePedidoNuevo.carrito.map((item) => ({
			...item,
			producto: page.data.catalogo.find((p) => p.id === item.id)
		}))
	);
	let existeRelacionOportunidad = $derived(pedidos.some((p) => p.id_oportunidad != null));
	let idAgrupaciones = $derived([
		...new Set(pedidos.map((pedido) => pedido.id_agrupacion).filter(Boolean))
	]);

	// ESTADOS
	let actualizando = $state(false);
	let mensaje = $state('');
	let expandidos = $state<Record<string, boolean>>({}); // Controla el "leer más" por tarjeta

	// HELPERS
	const formatFecha = (iso: string) =>
		new Intl.DateTimeFormat('es-MX', { dateStyle: 'short' }).format(new Date(iso));

	// ACCIONES
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

	async function limpiarCarrito() {
		StorePedidoEditar.limpiar();
		StorePedidoNuevo.limpiar();
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
</script>

<div class="editor-container">
	<!-- PEDIDOS A CREAR (NUEVOS) -->
	{#if StorePedidoNuevo.carrito.length > 0 && idAgrupaciones.length == 1}
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
	{/if}

	<!-- LISTA DE PEDIDOS A EDITAR -->
	<div class="lista-tarjetas">
		{#each pedidos as pedido (pedido.id)}
			<div class="card">
				<!-- Header: Código y Estatus -->
				<header class="row justify-between">
					<strong class="codigo">{pedido.catalogo?.codigo || 'Sin código'}</strong>
					{#if fasesPedido && pedido.estatus !== undefined}
						<span class="badge" style={fasesPedido[pedido.estatus]?.estilo}>
							{fasesPedido[pedido.estatus]?.actual}
						</span>
					{/if}
				</header>

				<!-- Inputs de Edición Compactos -->
				<div class="row form-grid">
					<label class="input-group">
						<span class="label-text">Cant.</span>
						<input
							type="number"
							min="0"
							step="1"
							class="input-sm"
							value={pedido.cantidad ?? 0}
							oninput={(e) => actualizarCampo(pedido.id, 'cantidad', e.currentTarget.value)}
						/>
					</label>
					<label class="input-group">
						<span class="label-text">Precio U.</span>
						<input
							type="number"
							min="0"
							step="0.01"
							class="input-sm"
							value={pedido.precio_unitario ?? 0}
							oninput={(e) => actualizarCampo(pedido.id, 'precio_unitario', e.currentTarget.value)}
						/>
					</label>
					<label class="input-group">
						<span class="label-text">Moneda</span>
						<select
							class="select-sm"
							value={pedido.moneda ?? 'MXN'}
							onchange={(e) => actualizarCampo(pedido.id, 'moneda', e.currentTarget.value)}
						>
							<option value="MXN">MXN</option>
							<option value="USD">USD</option>
						</select>
					</label>
				</div>

				<!-- Enlaces y Fecha -->
				<div class="row enlaces">
					<span class="fecha">{formatFecha(pedido.fecha_creacion)}</span>
					{#if pedido.id_oportunidad}
						<span class="separador">•</span>
						<a href="/oportunidades/{pedido.id_oportunidad}" onclick={(e) => e.stopPropagation()}>
							Op: {pedido.id_oportunidad.split('-').pop()}
						</a>
					{/if}
					{#if pedido.oportunidades?.id_cliente}
						<span class="separador">•</span>
						<a
							href="/clientes/{pedido.oportunidades?.id_cliente}"
							onclick={(e) => e.stopPropagation()}
						>
							Cli: {pedido.oportunidades?.clientes?.razon_social ||
								pedido.oportunidades?.id_cliente.split('-').pop()}
						</a>
					{/if}
				</div>

				<!-- Sección Colapsable: Leer Más -->
				{#if pedido.catalogo?.descripcion || pedido.catalogo?.caracteristicas}
					<div class="detalles">
						{#if expandidos[pedido.id]}
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
									<p class="desc">
										<strong>Necesidades:</strong>
										{pedido.oportunidades.necesidades}
									</p>
								{/if}
								<div class="row motivo truncate">
									<small>{pedido.oportunidades?.motivo} | Fase {pedido.oportunidades?.fase}</small>
								</div>
							</div>
							<button class="link-btn" onclick={() => (expandidos[pedido.id] = false)}
								>Ocultar detalles</button
							>
						{:else}
							<button class="link-btn" onclick={() => (expandidos[pedido.id] = true)}
								>Leer más detalles...</button
							>
						{/if}
					</div>
				{/if}

				<!-- Acciones de Tarjeta -->
				<div class="card-footer">
					<button class="btn-ghost" onclick={() => StorePedidoEditar.pop(pedido.id)}>Quitar</button>
					<button class="btn-danger" onclick={() => eliminarPedido(pedido.id)}>Eliminar</button>
				</div>
			</div>
		{/each}
	</div>

	<!-- MENSAJES -->
	{#if mensaje}
		<div class="mensaje-alerta">{mensaje}</div>
	{/if}

	<!-- ACCIONES GLOBALES -->
	{#if StorePedidoEditar.carrito.length > 0}
		<div class="acciones-fijas">
			<button class="butter variant-outline" onclick={limpiarCarrito}>Limpiar</button>
			<button class="butter variant-outline" onclick={() => goto('/catalogo')}
				>+Agregar Producto</button
			>
			{#if existeRelacionOportunidad}
				<button class="butter variant-danger" onclick={eliminarRelacion}
					>Desvincular Oportunidad</button
				>
			{/if}
			<button class="butter variant-primary" onclick={editarBorrador} disabled={actualizando}>
				{actualizando ? 'Actualizando...' : 'Guardar Cambios'}
			</button>
		</div>
	{:else}
		<p class="estado-vacio">No hay pedidos seleccionados</p>
	{/if}
</div>

<style>
	.editor-container {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		position: relative;
		padding-bottom: 5rem; /* Espacio para barra de acciones */
	}

	.lista-tarjetas {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.card {
		background: #ffffff;
		border: 1px solid #e2e8f0;
		border-radius: 6px;
		padding: 0.75rem 1rem;
		font-size: 0.875rem;
		color: #334155;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
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

	/* Formulario en tarjeta */
	.form-grid {
		display: grid;
		grid-template-columns: 1fr 1.5fr 1fr;
		gap: 0.5rem;
		background: #f8fafc;
		padding: 0.5rem;
		border-radius: 4px;
		border: 1px solid #f1f5f9;
	}

	.input-group {
		display: flex;
		flex-direction: column;
		gap: 0.1rem;
	}

	.label-text {
		font-size: 0.65rem;
		text-transform: uppercase;
		color: #64748b;
		font-weight: 600;
	}

	.input-sm,
	.select-sm {
		width: 100%;
		padding: 0.25rem 0.4rem;
		border: 1px solid #cbd5e1;
		border-radius: 4px;
		font-size: 0.85rem;
		background: white;
	}

	.input-sm:focus,
	.select-sm:focus {
		outline: none;
		border-color: #3b82f6;
	}

	/* Enlaces y metadatos */
	.fecha {
		color: #475569;
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

	/* Detalles expandibles */
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

	/* Acciones Footer Tarjeta */
	.card-footer {
		display: flex;
		justify-content: flex-end;
		gap: 0.5rem;
		margin-top: 0.25rem;
		padding-top: 0.5rem;
		border-top: 1px solid #f1f5f9;
	}
	.btn-ghost {
		background: transparent;
		border: 1px solid #cbd5e1;
		color: #475569;
		padding: 0.25rem 0.75rem;
		border-radius: 4px;
		font-size: 0.75rem;
		cursor: pointer;
	}
	.btn-danger {
		background: #fef2f2;
		border: 1px solid #fca5a5;
		color: #ef4444;
		padding: 0.25rem 0.75rem;
		border-radius: 4px;
		font-size: 0.75rem;
		cursor: pointer;
	}
	.btn-ghost:hover {
		background: #f8fafc;
	}
	.btn-danger:hover {
		background: #fee2e2;
	}

	/* Productos Nuevos */
	.nuevos-container {
		margin-top: 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	.title-nuevos {
		font-size: 0.85rem;
		color: #64748b;
		margin: 0;
	}
	.mini-card {
		padding: 0.5rem 0.75rem;
		flex-direction: row;
	}
	.stepper {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		background: #f1f5f9;
		border-radius: 4px;
		padding: 0.1rem;
	}
	.btn-step {
		background: white;
		border: 1px solid #cbd5e1;
		border-radius: 3px;
		width: 24px;
		height: 24px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		font-weight: bold;
		color: #334155;
	}
	.btn-step:hover {
		background: #e2e8f0;
	}
	.valor-step {
		min-width: 20px;
		text-align: center;
		font-size: 0.85rem;
		font-weight: 500;
	}

	/* Alertas y Bottom Bar */
	.mensaje-alerta {
		padding: 0.5rem;
		background: #e0f2fe;
		color: #0369a1;
		border-radius: 4px;
		font-size: 0.85rem;
		text-align: center;
	}
	.estado-vacio {
		text-align: center;
		color: #94a3b8;
		font-style: italic;
	}

	.acciones-fijas {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		padding: 1rem;
		display: flex;
		justify-content: flex-end;
		gap: 0.5rem;
		z-index: 10;
	}

	/* Adaptación para clases butter genéricas del usuario */
	.butter {
		padding: 0.5rem 1rem;
		border-radius: 6px;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		border: none;
	}
	.variant-outline {
		background: white;
		border: 1px solid #cbd5e1;
		color: #334155;
	}
	.variant-danger {
		background: #fef2f2;
		color: #ef4444;
		border: 1px solid #fecaca;
	}
	.variant-primary {
		background: #2563eb;
		color: white;
	}
	.variant-primary:disabled {
		background: #93c5fd;
		cursor: not-allowed;
	}
</style>
