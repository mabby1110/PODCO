<script lang="ts">
	import { onMount } from 'svelte';
	import { goto, invalidateAll } from '$app/navigation';

	import SubirOcc from '../Documentos/SubirOcc.svelte';
	import { fasesPedido } from '$lib';
	import { StoreVenta } from '$lib/stores/pedidos/StorePedidoOportunidad.svelte';
	import { StorePedidoEditar } from '$lib/stores/pedidos/StorePedidoEditar.svelte';
	import { StorePedidoNuevo } from '$lib/stores/pedidos/StorePedidoNuevo.svelte';
	import { StoreContextoRelacion } from '$lib/stores/pedidos/StoreContextoRelacion.svelte';

	let { oportunidad, disable }: { oportunidad: undefined; disable?: boolean } = $props();

	let expandidos = $state<Record<string, boolean>>({});
	let actualizando = $state(false);
	let mensaje = $state('');

	const formatMoneda = (val: number | null | undefined, moneda: string = 'USD') => {
		if (val == null) return 'Sin precio';

		return new Intl.NumberFormat('es-MX', {
			style: 'currency',
			currency: moneda,
			currencyDisplay: 'narrowSymbol'
		}).format(val);
	};

	/*
	 * Se genera una nueva referencia para que Svelte 5 detecte
	 * correctamente los cambios realizados sobre el carrito.
	 */
	let carrito = $derived(StoreVenta.carrito);

	let pedidosCotizados = $derived(oportunidad.pedidos.filter((pedido) => pedido.fase === 3));

	let pedidosAgrupados = $derived.by(() => {
		const grupos = pedidosCotizados.reduce(
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

				const seleccionado = carrito.some((item) => item.id === pedido.id);

				if (seleccionado) {
					acc[clave].totalGrupo += (pedido.precio_unitario || 0) * (pedido.cantidad || 0);
				}

				return acc;
			},
			{} as Record<
				string,
				{
					id_agrupacion: string;
					pedidos: typeof pedidosCotizados;
					totalGrupo: number;
				}
			>
		);

		return Object.values(grupos);
	});

	/*
	 * Un producto es inválido cuando:
	 *
	 * - Está en stock
	 * - Es serializado
	 * - No tiene serial
	 *
	 * También se considera inválido un producto seleccionado sin precio.
	 */
	let pedidosInvalidos = $derived.by(() => {
		return oportunidad.pedidos
			.filter((pedido) => carrito.some((item) => item.id === pedido.id))
			.some((pedido) => {
				const item = carrito.find((item) => item.id === pedido.id);

				if (!item) return false;

				if (pedido.precio_unitario == null) {
					return true;
				}

				if (
					item.stock === true &&
					pedido.catalogo?.tipo_producto?.es_serializado === true &&
					!item.serial?.trim()
				) {
					return true;
				}

				return false;
			});
	});

	let tieneSeleccion = $derived(carrito.length > 0);

	let puedeSubirOcc = $derived(tieneSeleccion && !pedidosInvalidos);

	function obtenerItem(id: string) {
		return carrito.find((item) => item.id === id);
	}

	function cambiarEstadoPedido(id: string, nuevoEstado: string) {
		switch (nuevoEstado) {
			case 'descartar':
				StoreVenta.pop(id);
				break;

			case 'pedido':
				StoreVenta.push(id, false);
				break;

			case 'stock':
				StoreVenta.push(id, true);
				break;

			default:
				break;
		}
	}

	function ingresarSerial(id: string, serial: string) {
		const valor = serial.trim();
		const index = StoreVenta.carrito.findIndex((item) => item.id === id);

		if (index === -1) {
			StoreVenta.carrito.push({
				id,
				stock: true,
				serial: valor
			});
		} else {
			/*
			 * Reasignar el elemento completo evita depender de mutaciones
			 * profundas que pueden no activar correctamente la reactividad.
			 */
			StoreVenta.carrito[index] = {
				...StoreVenta.carrito[index],
				stock: true,
				serial: valor
			};
		}

		/*
		 * Si StoreVenta expone algún mecanismo de actualización,
		 * push/pop deberían encargarse de notificar al store.
		 */
	}

	async function descartarGrupo(pedidos: typeof pedidosCotizados) {
		if (actualizando || !pedidos.length) return;

		const confirmar = window.confirm('¿Estás seguro de que deseas descartar estos pedidos?');

		if (!confirmar) return;

		actualizando = true;
		mensaje = '';

		try {
			const formData = new FormData();

			formData.append(
				'pedidosAActualizar',
				JSON.stringify(
					pedidos.map((pedido) => ({
						id: pedido.id
					}))
				)
			);

			const response = await fetch('/pedidos?/descartar', {
				method: 'POST',
				body: formData
			});

			const result = await response.json();

			if (!response.ok || result?.type === 'failure') {
				throw new Error(result?.data?.error || result?.error || 'Error al descartar los pedidos');
			}

			StoreVenta.limpiar();

			await invalidateAll();
		} catch (error) {
			console.error('Error al descartar pedidos:', error);

			mensaje = error instanceof Error ? error.message : 'Error al descartar los pedidos';
		} finally {
			actualizando = false;
		}
	}

	function toggleDetalles(id: string) {
		expandidos[id] = !expandidos[id];
	}

	onMount(() => {
		StoreVenta.limpiar();
	});
</script>

{#each pedidosAgrupados as grupo}
	{@const existeSeleccion = grupo.pedidos.some((pedido) =>
		carrito.some((item) => item.id === pedido.id)
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
			{#each grupo.pedidos as pedido (pedido.id)}
				{@const itemStore = obtenerItem(pedido.id)}
				{@const esSerializado = pedido.catalogo?.tipo_producto?.es_serializado === true}
				{@const serialInvalido =
					itemStore?.stock === true && esSerializado && !itemStore?.serial?.trim()}
				{@const pedidoInvalido = itemStore && pedido.precio_unitario == null}

				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<div
					class="tarjeta honey"
					class:selected={!!itemStore}
					class:invalid={!!pedidoInvalido || serialInvalido}
				>
					<strong class="titulo">
						{pedido.catalogo?.codigo || 'Sin código'}
					</strong>

					<div class="contenido">
						{#if !disable}
							<select
								class="select-estado"
								class:stock={itemStore?.stock === true}
								class:pedido={itemStore?.stock === false}
								value={!itemStore ? '' : itemStore.stock ? 'stock' : 'pedido'}
								onchange={(e) => {
									e.stopPropagation();
									cambiarEstadoPedido(pedido.id, e.currentTarget.value);
								}}
								onclick={(e) => e.stopPropagation()}
							>
								<option value="" disabled>Selecciona una opción</option>
								<option value="pedido">Sobre pedido</option>
								<option value="stock">En stock</option>
								<option value="descartar">Descartar</option>
							</select>
						{/if}
						{#if esSerializado && itemStore?.stock}
							<input
								type="text"
								placeholder="Número de serie"
								value={itemStore.serial ?? ''}
								class:input-error={serialInvalido}
								oninput={(e) => {
									e.stopPropagation();
									ingresarSerial(pedido.id, e.currentTarget.value);
								}}
								onclick={(e) => e.stopPropagation()}
							/>

							{#if serialInvalido}
								<small class="error-text"> El número de serie es obligatorio. </small>
							{/if}
						{/if}

						<span class="precio" class:text-danger={pedido.precio_unitario == null}>
							{pedido.cantidad} x
							{formatMoneda(pedido.precio_unitario, pedido.moneda)}
						</span>
					</div>

					<div class="resumen">
						<b class="subtotal">
							{formatMoneda((pedido.precio_unitario || 0) * (pedido.cantidad || 0), pedido.moneda)}
						</b>
					</div>
				</div>

				<div class="detalles">
					{#if pedido.catalogo?.descripcion || pedido.catalogo?.caracteristicas || pedido.oportunidades?.necesidades}
						{#if expandidos[pedido.id]}
							<!-- svelte-ignore a11y_click_events_have_key_events -->
							<!-- svelte-ignore a11y_no_static_element_interactions -->
							<div class="contenido-expandido" onclick={(e) => e.stopPropagation()}>
								{#if pedido.catalogo?.descripcion}
									<p class="desc">
										<strong>Desc:</strong>
										{pedido.catalogo.descripcion}
									</p>
								{/if}

								{#if pedido.catalogo?.caracteristicas}
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
									toggleDetalles(pedido.id);
								}}
							>
								Ocultar detalles
							</button>
						{:else}
							<button
								class="link-btn"
								onclick={(e) => {
									e.stopPropagation();
									toggleDetalles(pedido.id);
								}}
							>
								Leer más detalles...
							</button>
						{/if}
					{/if}
				</div>
			{/each}

			<div class="total">
				<h1>
					<b>{formatMoneda(grupo.totalGrupo)}</b>
				</h1>
			</div>

			{#if grupo.pedidos.length === 0}
				<p class="estado-vacio">No hay pedidos pendientes por cotizar en este grupo.</p>
			{/if}
		</div>
		{#if !disable}
			<div class="acciones-panel">
				{#if existeSeleccion}
					<div class="occ-wrapper">
						{#if pedidosInvalidos}
							<div class="alerta-error">
								{#if carrito.some((item) => item.stock === true && !item.serial?.trim() && oportunidad.pedidos.some((p) => p.id === item.id && p.catalogo?.tipo_producto?.es_serializado === true))}
									Completa el número de serie de los productos en stock antes de subir el OCC.
								{:else}
									Revisa los productos seleccionados antes de subir el OCC.
								{/if}
							</div>
						{/if}

						{#if puedeSubirOcc}
							<SubirOcc
								tipo="docs_cotizaciones"
								action="/documentos?/subirOcc"
								oportunidad={{
									id: oportunidad?.id,
									cliente:
										oportunidad?.clientes?.nombre_comercial || oportunidad?.clientes?.razon_social
								}}
								required
							/>
						{/if}
					</div>
				{:else}
					<div class="acciones-fijas">
						<button
							class="butter"
							type="button"
							disabled={actualizando}
							onclick={() => descartarGrupo(grupo.pedidos)}
						>
							{actualizando ? 'Descartando...' : 'Descartar'}
						</button>
					</div>
				{/if}
			</div>
		{/if}
	</div>
{/each}

<style>
	.cotizacion-container {
		flex-grow: 1;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding: 16px;
		border: 2px solid var(--color-muted);
		border-radius: 32px;
	}

	.lista-tarjetas {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.tarjeta {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(var(--e), 1fr));
		align-items: baseline;
		border: none;
	}

	.tarjeta.invalid {
		border-radius: 8px;
		background: #fff7f7;
		outline: 1px solid #fca5a5;
		padding: 0.5rem;
	}

	.titulo-meta {
		display: flex;
		gap: var(--a);
		flex-wrap: wrap;
		align-items: baseline;
		font-size: small;
	}

	.titulo {
		grid-column: span 4;
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

	.contenido input {
		min-width: 180px;
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
		margin: 0 0 0.4rem;
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

	.acciones-panel {
		margin-top: 0.5rem;
	}

	.acciones-fijas {
		display: flex;
		justify-content: flex-end;
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
		margin-bottom: 0.75rem;
	}

	.input-error {
		border: 1px solid #ef4444;
		outline: 1px solid #ef4444;
	}

	.error-text {
		color: #b91c1c;
		font-size: 0.75rem;
		width: 100%;
	}

	.estado-vacio {
		text-align: center;
		color: #94a3b8;
		font-style: italic;
		margin-top: 1rem;
	}

	button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
</style>
