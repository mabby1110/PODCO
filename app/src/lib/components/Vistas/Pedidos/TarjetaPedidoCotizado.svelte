<script lang="ts">
	import { untrack } from 'svelte';
	import { invalidateAll } from '$app/navigation';
	import { deserialize } from '$app/forms';

	import SubirOcc from '../Documentos/SubirOcc.svelte';
	import TarjetaDoc from '../Documentos/TarjetaDoc.svelte';
	import { fasesPedido } from '$lib';
	import { StoreVenta } from '$lib/stores/pedidos/StorePedidoOportunidad.svelte';

	interface Pedido {
		id: string;
		fase: number;
		id_agrupacion: string | null;
		precio_unitario: number | null;
		cantidad: number | null;
		moneda: string | null;
		catalogo?: {
			codigo?: string | null;
			descripcion?: string | null;
			caracteristicas?: unknown;
			tipo_producto?: { es_serializado?: boolean | null } | null;
		} | null;
		oportunidades?: { necesidades?: string | null } | null;
		docs_cotizaciones?: any | null;
	}

	interface Grupo {
		id_agrupacion: string;
		pedidos: Pedido[];
	}

	interface Oportunidad {
		id: string;
		pedidos: Pedido[];
		clientes?: {
			nombre_comercial?: string | null;
			razon_social?: string | null;
		} | null;
	}

	let { oportunidad, disable = false }: { oportunidad: Oportunidad; disable?: boolean } = $props();

	let expandidos = $state<Record<string, boolean>>({});
	let actualizando = $state(false);
	let mensaje = $state('');

	const carrito = $derived(StoreVenta.carrito);
	const itemsPorId = $derived(new Map(carrito.map((item) => [item.id, item])));

	const pedidosCotizados = $derived(oportunidad.pedidos.filter((p) => p.fase === 3));

	const grupos = $derived.by<Grupo[]>(() => {
		const mapa = new Map<string, Grupo>();
		for (const pedido of pedidosCotizados) {
			const clave = pedido.id_agrupacion || 'sin_agrupar';
			const existente = mapa.get(clave);
			if (existente) existente.pedidos.push(pedido);
			else mapa.set(clave, { id_agrupacion: clave, pedidos: [pedido] });
		}
		return [...mapa.values()];
	});

	const gruposConSeleccion = $derived(
		grupos.filter((g) => g.pedidos.some((p) => itemsPorId.has(p.id))).length
	);

	$effect(() => {
		oportunidad.id;
		untrack(() => StoreVenta.limpiar());
	});

	$effect(() => {
		const vigentes = new Set(pedidosCotizados.map((p) => p.id));
		untrack(() => {
			StoreVenta.carrito
				.filter((item) => !vigentes.has(item.id))
				.forEach((item) => StoreVenta.pop(item.id));
		});
	});

	function normalizarMoneda(moneda: string | null | undefined): string {
		if (!moneda) return 'USD';
		const m = moneda.toUpperCase();
		return m === 'MX' ? 'MXN' : m;
	}

	function formatMoneda(val: number | null | undefined, moneda: string | null = 'USD') {
		if (val == null) return 'Sin precio';
		return new Intl.NumberFormat('es-MX', {
			style: 'currency',
			currency: normalizarMoneda(moneda),
			currencyDisplay: 'narrowSymbol'
		}).format(val);
	}

	function subtotal(pedido: Pedido): number | null {
		if (pedido.precio_unitario == null) return null;
		return pedido.precio_unitario * (pedido.cantidad ?? 0);
	}

	function esSerializado(pedido: Pedido): boolean {
		return pedido.catalogo?.tipo_producto?.es_serializado === true;
	}

	function serialFaltante(pedido: Pedido): boolean {
		const item = itemsPorId.get(pedido.id);
		return !!item && item.stock === true && esSerializado(pedido) && !item.serial?.trim();
	}

	function sinPrecio(pedido: Pedido): boolean {
		return itemsPorId.has(pedido.id) && pedido.precio_unitario == null;
	}

	function tieneDetalles(pedido: Pedido): boolean {
		return !!(
			pedido.catalogo?.descripcion ||
			pedido.catalogo?.caracteristicas ||
			pedido.oportunidades?.necesidades
		);
	}

	function cambiarEstadoPedido(id: string, nuevoEstado: string) {
		StoreVenta.pop(id);
		if (nuevoEstado === 'pedido') StoreVenta.push(id, false);
		else if (nuevoEstado === 'stock') StoreVenta.push(id, true);
	}

	function ingresarSerial(id: string, serial: string) {
		const valor = serial.trim();
		const index = StoreVenta.carrito.findIndex((item) => item.id === id);
		if (index === -1) {
			StoreVenta.carrito.push({ id, stock: true, serial: valor });
		} else {
			StoreVenta.carrito[index] = { ...StoreVenta.carrito[index], stock: true, serial: valor };
		}
	}

	function toggleDetalles(id: string) {
		expandidos[id] = !expandidos[id];
	}

	async function descartarGrupo(pedidos: Pedido[]) {
		if (actualizando || pedidos.length === 0) return;
		if (!window.confirm('¿Estás seguro de que deseas descartar estos pedidos?')) return;

		actualizando = true;
		mensaje = '';

		try {
			const formData = new FormData();
			formData.append('pedidosAActualizar', JSON.stringify(pedidos.map((p) => ({ id: p.id }))));

			const response = await fetch('/pedidos?/descartar', {
				method: 'POST',
				headers: { 'x-sveltekit-action': 'true' },
				body: formData
			});

			const result = deserialize(await response.text());

			if (result.type === 'failure') {
				throw new Error((result.data?.error as string) || 'Error al descartar los pedidos');
			}
			if (result.type === 'error') {
				throw new Error(result.error?.message || 'Error al descartar los pedidos');
			}

			StoreVenta.limpiar();
			await invalidateAll();
		} catch (error) {
			mensaje = error instanceof Error ? error.message : 'Error al descartar los pedidos';
		} finally {
			actualizando = false;
		}
	}
	console.log(grupos[0].pedidos[0])
</script>

<div class="cotizaciones">
	{#each grupos as grupo (grupo.id_agrupacion)}
		{@const seleccionados = grupo.pedidos.filter((p) => itemsPorId.has(p.id))}
		{@const existeSeleccion = seleccionados.length > 0}
		{@const monedas = new Set(seleccionados.map((p) => normalizarMoneda(p.moneda)))}
		{@const monedaMixta = monedas.size > 1}
		{@const monedaGrupo = [...monedas][0] ?? normalizarMoneda(grupo.pedidos[0]?.moneda)}
		{@const totalGrupo = seleccionados.reduce((acc, p) => acc + (subtotal(p) ?? 0), 0)}
		{@const hayInvalidos = seleccionados.some((p) => sinPrecio(p) || serialFaltante(p))}
		{@const hayFaltaSerial = seleccionados.some(serialFaltante)}
		{@const bloqueadoPorOtroGrupo = existeSeleccion && gruposConSeleccion > 1}
		{@const puedeSubirOcc =
			existeSeleccion && !hayInvalidos && !monedaMixta && !bloqueadoPorOtroGrupo}
		{@const documento = grupo.pedidos[0].docs_cotizaciones}

		<div class="pedido">
			<div class="lista-tarjetas honey">
				<div class="titulo-meta">
					<div class="badge" style={fasesPedido[3]?.estilo}>
						<span>Cotizado</span>
					</div>

					{#if grupo.id_agrupacion !== 'sin_agrupar'}
						<p class="agrupacion-titulo">Grupo: {grupo.id_agrupacion}</p>
					{/if}
				</div>

				{#each grupo.pedidos as pedido (pedido.id)}
					{@const itemStore = itemsPorId.get(pedido.id)}
					{@const serializado = esSerializado(pedido)}
					{@const serialInvalido = serialFaltante(pedido)}
					{@const precioInvalido = sinPrecio(pedido)}

					<div
						class="tarjeta"
						class:selected={!!itemStore}
						class:invalid={precioInvalido || serialInvalido}
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
									aria-label="Estado de {pedido.catalogo?.codigo || 'pedido'}"
									value={!itemStore ? '' : itemStore.stock ? 'stock' : 'pedido'}
									onchange={(e) => cambiarEstadoPedido(pedido.id, e.currentTarget.value)}
								>
									<option value="" disabled>Selecciona una opción</option>
									<option value="pedido">Sobre pedido</option>
									<option value="stock">En stock</option>
									<option value="descartar">Descartar</option>
								</select>
							{/if}

							{#if serializado && itemStore?.stock}
								<input
									type="text"
									placeholder="Número de serie"
									aria-label="Número de serie de {pedido.catalogo?.codigo || 'pedido'}"
									aria-invalid={serialInvalido}
									value={itemStore.serial ?? ''}
									class:input-error={serialInvalido}
									oninput={(e) => ingresarSerial(pedido.id, e.currentTarget.value)}
								/>

								{#if serialInvalido}
									<small class="error-text">El número de serie es obligatorio.</small>
								{/if}
							{/if}

							<span class="precio" class:text-danger={pedido.precio_unitario == null}>
								{pedido.cantidad ?? 0} x
								{formatMoneda(pedido.precio_unitario, pedido.moneda)}
							</span>
						</div>

						<div class="resumen">
							<b class="subtotal">
								{formatMoneda(subtotal(pedido), pedido.moneda)}
							</b>
						</div>
					</div>

					{#if tieneDetalles(pedido)}
						<div class="detalles">
							{#if expandidos[pedido.id]}
								<div class="contenido-expandido">
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
							{/if}

							<button
								class="link-btn"
								type="button"
								aria-expanded={!!expandidos[pedido.id]}
								onclick={() => toggleDetalles(pedido.id)}
							>
								{expandidos[pedido.id] ? 'Ocultar detalles' : 'Leer más detalles...'}
							</button>
						</div>
					{/if}
				{/each}

				{#if monedaMixta}
					<p class="text-danger">No se pueden mezclar monedas en un mismo grupo.</p>
				{:else}
					<div class="total">
						<h1>
							<b>{formatMoneda(totalGrupo, monedaGrupo)}</b>
						</h1>
					</div>
				{/if}
				{#if documento?.preview}
					<TarjetaDoc src={documento.preview} title={documento.nombre ?? 'Cotización'} />
				{/if}

				{#if !disable}
					<div class="acciones-panel">
						{#if existeSeleccion}
							<div class="occ-wrapper">
								{#if bloqueadoPorOtroGrupo}
									<div class="alerta-error">Solo se puede procesar un grupo a la vez.</div>
								{:else if hayFaltaSerial}
									<div class="alerta-error">
										Completa el número de serie de los productos en stock antes de subir el OCC.
									</div>
								{:else if hayInvalidos}
									<div class="alerta-error">
										Revisa los productos seleccionados antes de subir el OCC.
									</div>
								{/if}

								{#if puedeSubirOcc}
									<SubirOcc
										tipo="docs_cotizaciones"
										action="/documentos?/subirOcc"
										oportunidad={{
											id: oportunidad.id,
											cliente:
												oportunidad.clientes?.nombre_comercial ||
												oportunidad.clientes?.razon_social
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
									{actualizando ? 'Descartando...' : 'Descartar todo'}
								</button>
							</div>
						{/if}
					</div>
				{/if}
			</div>
		</div>
	{:else}
		<p class="estado-vacio">No hay pedidos cotizados en esta oportunidad.</p>
	{/each}

	{#if mensaje}
		<p class="error-text" role="alert">{mensaje}</p>
	{/if}
</div>

<style>
	.cotizaciones {
		flex-grow: 1;
		display: flex;
		flex-direction: column;
		gap: 1rem;
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