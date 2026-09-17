<!-- SelecciónCotizacion.svelte -->
<script lang="ts">
	import { StorePedidoOportunidad } from '$lib/stores/pedidos/StorePedidoOportunidad.svelte';
	import { onMount } from 'svelte';
	import SubirCotizacion from '../Documentos/SubirCotizacion.svelte';
	import { fasesPedido } from '$lib';
	import { StorePedidoEditar } from '$lib/stores/pedidos/StorePedidoEditar.svelte';
	import { StorePedidoNuevo } from '$lib/stores/pedidos/StorePedidoNuevo.svelte';
	import { StoreContextoRelacion } from '$lib/stores/pedidos/StoreContextoRelacion.svelte';
	import { goto } from '$app/navigation';

	let { oportunidad } = $props();

	// DATOS DERIVADOS
	let pedidosAgrupados = $derived.by(() => {
		// 1. Filtramos los pedidos
		const pedidosFiltrados = oportunidad.pedidos.filter((p) => p.id_cotizacion != null);

		// 2. Agrupamos y calculamos el total por grupo
		const grupos = pedidosFiltrados.reduce(
			(acc, pedido) => {
				const clave = pedido.id_agrupacion || 'sin_agrupar';

				if (!acc[clave]) {
					acc[clave] = {
						id_agrupacion: clave,
						pedidos: [],
						totalGrupo: 0 // Agregamos el cálculo del total por grupo aquí
					};
				}

				acc[clave].pedidos.push(pedido);
				acc[clave].totalGrupo += (pedido.precio_unitario || 0) * (pedido.cantidad || 0);

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
				StorePedidoOportunidad.carrito.some((item) => item.id === p.id) &&
				(p.precio_unitario === null || p.precio_unitario === undefined || p.precio_unitario === 0)
		)
	);

	let pedidoACotizarInvalidoPorMoneda = $derived(
		oportunidad.pedidos.some((p) => p.moneda == 'USD') &&
			oportunidad.pedidos.some((p) => p.moneda == 'MXN') // Ajustado de MX a MXN según el select anterior
	);

	// ESTADOS
	let expandidos = $state<Record<string, boolean>>({});

	// ACCIONES
	function seleccionarPedido(id: string) {
		if (StorePedidoOportunidad.carrito.some((item) => item.id === id)) {
			StorePedidoOportunidad.pop(id);
		} else {
			StorePedidoOportunidad.push(id);
		}
	}

	function seleccionarPedidoCompleto() {
		// Extraemos todos los pedidos de los grupos para pasarlos a la lista
		const todosLosPedidos = pedidosAgrupados.flatMap((grupo) => grupo.pedidos);
		StorePedidoOportunidad.pushLista(todosLosPedidos);
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
		StorePedidoOportunidad.limpiar();
	});
</script>

<!-- Iteramos sobre los grupos -->
{#each pedidosAgrupados as grupo}
	<div class="cotizacion-container">
		<div class="badge" style={fasesPedido[3]?.estilo}>
			<span>Cotizado</span>
		</div>

		<div class="lista-tarjetas">
			<!-- Etiqueta opcional para mostrar a qué agrupación pertenece -->
			{#if grupo.id_agrupacion !== 'sin_agrupar'}
				<h4 class="agrupacion-titulo">Grupo: {grupo.id_agrupacion}</h4>
			{/if}

			<!-- Iteramos sobre los pedidos de este grupo -->
			{#each grupo.pedidos as pedido (pedido.id)}
				{@const seleccionado = StorePedidoOportunidad.carrito.some((item) => item.id === pedido.id)}
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
						<b class="subtotal">${(pedido.precio_unitario || 0) * (pedido.cantidad || 0)}</b>
					</div>

					<!-- Sección Colapsable -->
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

			<!-- Validaciones y Totales POR GRUPO -->
			{#if pedidoACotizarInvalidoPorMoneda}
				<p class="text-danger">No se pueden mezclar USD con MXN</p>
			{:else}
				<hr />
				<h1 class="total"><b>{formatMoneda(grupo.totalGrupo)}</b></h1>
			{/if}

			{#if grupo.pedidos.length === 0}
				<p class="estado-vacio">No hay pedidos pendientes por cotizar en este grupo.</p>
			{/if}
		</div>

		<!-- Área de Acciones / Subida -->
		<div class="acciones-panel">
			{#if StorePedidoOportunidad.carrito.length > 0}
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
							cliente: oportunidad?.clientes.nombre_comercial || oportunidad?.clientes.razon_social
						}}
						required
					/>
				{/if}
				<!-- Verificamos si existe al menos un grupo con pedidos para mostrar el botón general -->
			{:else if pedidosAgrupados.length > 0}
				<div class="acciones-fijas">
					<button class="butter" onclick={seleccionarPedidoCompleto}>
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
