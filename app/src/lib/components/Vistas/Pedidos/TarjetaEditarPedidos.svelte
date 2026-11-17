<!-- VistaEditorPedidos.svelte -->
<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { page } from '$app/state';
	import { fasesPedido } from '$lib';
	import BindableSelect from '$lib/components/Formularios/BindableSelect.svelte';
	import ItemLista from '$lib/components/Tarjetas/ItemLista.svelte';
	import { StoreAplicacion } from '$lib/stores/app/StoreAplicacion.svelte';
	import { StoreContextoRelacion } from '$lib/stores/pedidos/StoreContextoRelacion.svelte';
	import { StorePedidoEditar } from '$lib/stores/pedidos/StorePedidoEditar.svelte';
	import { StorePedidoNuevo } from '$lib/stores/pedidos/StorePedidoNuevo.svelte';
	import { formatMoneda, obtenerUnicos } from '$lib/utils/util';

	// DATOS DERIVADOS
	let listaPedidos = $state(page.data.pedidos);
	let pedidos = $derived(
		listaPedidos.filter((p) => StorePedidoEditar.carrito.some((item) => item.id === p.id))
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
	let moneda = $state(pedidos.find((p) => p.moneda != null)?.moneda);
	console.log('moneda', moneda);

	// ESTADOS
	let actualizando = $state(false);

	// CONDICIONES PARA EDITAR
	// recuento agrupaciones
	let recuentoAgrupaciones = $derived(obtenerUnicos(pedidos, 'id_agrupacion'));
	let recuentoOportunidades = $derived(obtenerUnicos(pedidos, 'id_oportunidad'));
	console.log('pedidos, recuentos:\n', recuentoAgrupaciones, recuentoOportunidades);
	// no se combina tipo de moneda
	let invalidoPorMoneda = $derived(
		pedidos.some((p) => p.moneda == 'USD') && pedidos.some((p) => p.moneda == 'MXN')
	);
	// no se puede editar un pedido fase > 2
	let pedidosNoEditables = $derived(pedidos.filter((p) => Number(p.fase) > 2));
	let puedeEditar = $derived(pedidosNoEditables.length == 0);

	// ACCIONES
	async function limpiarCarritoCompleto() {
		StorePedidoEditar.limpiar();
		StorePedidoNuevo.limpiar();
		StoreContextoRelacion.limpiar();
	}
	async function actualizarPedido() {
		if (!puedeEditar) return;
		actualizando = true;
		if (StorePedidoEditar.carrito.length == 0) {
			try {
				const formData = new FormData();

				if (StoreContextoRelacion.id_oportunidad) {
					formData.append('idOportunidad', StoreContextoRelacion.id_oportunidad);
				}
				if (StorePedidoNuevo.carrito) {
					formData.append('carrito', JSON.stringify(StorePedidoNuevo.carrito));
				}

				const response = await fetch('/pedidos?/nuevo', {
					method: 'POST',
					body: formData
				});
				const result = await response.json();

				if (!response.ok || result?.type === 'failure') {
					throw new Error(result?.data?.error || result?.error || 'Error al crear pedido');
				}

				const idOportunidad = StoreContextoRelacion.id_oportunidad;

				if (idOportunidad) {
					await goto(`/oportunidades/${idOportunidad}`);
				} else {
					await goto(`/pedidos`);
				}
				limpiarCarritoCompleto();
				invalidateAll();
			} catch (error) {
				console.error('Error al crear pedido:', error);
			} finally {
				actualizando = false;
				await goto(`/pedidos`);
			}
		} else {
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

				if (recuentoAgrupaciones.length == 1) {
					formData.append('pedidosACrear', JSON.stringify(productos));
				}

				if (StoreContextoRelacion.id_oportunidad) {
					formData.append('idOportunidad', StoreContextoRelacion.id_oportunidad);
				}

				if (!invalidoPorMoneda) {
					formData.append('moneda', moneda);
				}

				const response = await fetch('/pedidos?/actualizarPedido', {
					method: 'POST',
					body: formData
				});
				const result = await response.json();

				if (!response.ok || result?.type === 'failure') {
					throw new Error(result?.data?.error || result?.error || 'Error al actualizar el pedido');
				}

				const idOportunidad = StoreContextoRelacion.id_oportunidad;

				if (idOportunidad) {
					await goto(`/oportunidades/${idOportunidad}`);
				}
				limpiarCarritoCompleto();
				StoreAplicacion.reset();
				invalidateAll();
			} catch (error) {
				console.error('Error al actualizar pedido:', error);
			} finally {
				actualizando = false;
				await goto(`/pedidos`);
			}
		}
	}
	async function agruparPedidos() {
		if (!puedeEditar) return;
		actualizando = true;

		try {
			const tieneOportunidadRelacionada = pedidos.some(
				(pedido) =>
					pedido.id_oportunidad !== null &&
					pedido.id_oportunidad !== StoreContextoRelacion.id_oportunidad
			);

			if (tieneOportunidadRelacionada) {
				const confirmar = window.confirm(
					'Uno o más pedidos tienen una oportunidad relacionada. ¿Estás seguro de que deseas continuar? Esto podría eliminar o modificar las relaciones con oportunidades.'
				);
				if (!confirmar) {
					actualizando = false;
					return;
				}
			}

			const formData = new FormData();
			formData.append('pedidosAActualizar', JSON.stringify(pedidos));

			const response = await fetch('/pedidos?/agruparPedido', {
				method: 'POST',
				body: formData
			});
			const result = await response.json();

			if (!response.ok || result?.type === 'failure') {
				throw new Error(result?.data?.error || result?.error || 'Error al agrupar el pedido');
			}

			limpiarCarritoCompleto();
			StoreAplicacion.reset();
			invalidateAll();
		} catch (error) {
			console.error('Error al actualizar pedido:', error);
		} finally {
			actualizando = false;
			await goto(`/pedidos`);
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

			StoreContextoRelacion.limpiar();
			StoreAplicacion.reset();
			invalidateAll();
		} catch (error) {
			console.error('Error al eliminar relación:', error);
		}
	}
	async function eliminarPedido() {
		const confirmar = window.confirm(
			'¿Estás seguro de que deseas continuar? Esto va a eliminar definitivamente'
		);
		if (!confirmar) return;

		try {
			const formData = new FormData();
			formData.append('pedidosAEliminar', JSON.stringify(pedidos));

			const response = await fetch('/pedidos?/eliminar', { method: 'POST', body: formData });
			const result = await response.json();

			if (!response.ok || result?.type === 'failure') {
				throw new Error(result?.data?.error || result?.error || 'Error al eliminar el pedido');
			}

			StorePedidoEditar.limpiar();
			invalidateAll();
		} catch (error) {
			console.error('Error al eliminar pedido:', error);
		}
	}
</script>

<!-- pedidos a editar -->
{#if StorePedidoEditar.carrito.length > 0}
	<div class="contenedor-grupo milk">
		{#each pedidos as pedido (pedido.id)}
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<ItemLista>
				{#snippet acciones()}
					<button class="jelly rojo" onclick={() => StorePedidoEditar.pop(pedido.id)}>✕</button>
					<div class="badge" style={fasesPedido[pedido.fase]?.estilo}>
						<span>{fasesPedido[pedido.fase]?.actual}</span>
					</div>
				{/snippet}
				{#snippet meta()}
					<div class="enlaces">
						{#if pedido.id_oportunidad}
							<a href="/oportunidades/{pedido.id_oportunidad}" onclick={(e) => e.stopPropagation()}>
								Op {pedido.oportunidades?.clientes?.razon_social ||
									pedido.oportunidades?.clientes?.nombre_comercial}
							</a>
						{/if}
					</div>
				{/snippet}
				{#snippet titulo()}
					<strong class="codigo">{pedido.catalogo?.codigo || 'Sin código'}</strong>
				{/snippet}
				{#snippet contenido()}
					{#if pedido.fase <= 2}
						<input
							type="number"
							min="0"
							step="1"
							title="Cantidad"
							class="milk"
							placeholder="Cantidad"
							bind:value={pedido.cantidad}
						/>
						<div class="input-moneda">
							<span class="simbolo">$</span>
							<input
								id="pu"
								type="number"
								min="0"
								step="1"
								title="Precio Unitario"
								class="milk"
								placeholder="0.00"
								bind:value={pedido.precio_unitario}
							/>
						</div>
						<span class="input-moneda">
							{pedido.moneda}
						</span>
						<BindableSelect
							bind:value={pedido.ref}
							list={['FASTRAQ', 'Lista de precios']}
							name="ref"
							placeholder="De donde se obtiene precio"
						/>
						<div class="resumen-pedido">
							<b class="subtotal">${pedido.precio_unitario * pedido.cantidad}</b>
						</div>
					{:else}
						<span class="precio" class:text-danger={pedido.precio_unitario == null}>
							{pedido.cantidad} x
							{formatMoneda(pedido.precio_unitario, pedido.moneda)}
						</span>
						<b class="subtotal">
							{formatMoneda((pedido.precio_unitario || 0) * (pedido.cantidad || 0), pedido.moneda)}
						</b>
					{/if}
				{/snippet}
			</ItemLista>
		{/each}
		<div class="resumen-grupo">
			{#if invalidoPorMoneda}
				<p>no se pueden mezclar USD con MX</p>
			{:else}
				<h1 class="total"><b>{formatMoneda(total)}</b></h1>
				<select class="input-s" title="Moneda" bind:value={moneda}>
					<option value="USD">USD</option>
					<option value="MXN">MXN</option>
				</select>
			{/if}
		</div>
	</div>
	<div class="acciones-fijas">
		{#if puedeEditar}
			<button
				class="butter"
				type="button"
				aria-label="Limpiar"
				title="Limpiar"
				onclick={limpiarCarritoCompleto}
			>
				<img src="/clean.svg" alt="Limpiar carrito" />
			</button>
			{#if StorePedidoEditar.carrito.length > 0 && StorePedidoNuevo.carrito.length == 0}
				<button
					class="butter accion rojo"
					onclick={eliminarRelacion}
					aria-label="Eliminar relación"
					title="Eliminar relación"
				>
					<img src="/eliminar-relacion.svg" alt="Elimininar relacion" />
				</button>
				<button class="butter accion" onclick={agruparPedidos} aria-label="Agrupar" title="Agrupar">
					<img src="/merge.svg" alt="Agrupar" />
				</button>
				<button
					class="butter accion rojo"
					type="button"
					aria-label="Eliminar"
					title="Eliminar"
					onclick={eliminarPedido}
				>
					<img src="/remove.svg" alt="Eliminar carrito" />
				</button>
			{/if}
		{/if}
	</div>
{/if}

<!-- pedidos nuevos -->
{#if StorePedidoNuevo.carrito.length > 0}
	<div class="contenedor-grupo milk">
		<div class="encabezado">
			<button
				class="butter jelly rojo"
				type="button"
				aria-label="Limpiar"
				title="Limpiar"
				onclick={StorePedidoNuevo.limpiar}
			>
				✕
			</button>
			<h4 class="titulo">Crear pedido:</h4>
			<div class="acciones"></div>
		</div>
		{#each productos as producto}
			<ItemLista>
				{#snippet titulo()}
					<span class="codigo">{producto.producto.descripcion}</span>
					<span class="codigo">{producto.producto.codigo}</span>
				{/snippet}

				{#snippet contenido()}
					<div class="contador">
						<input
							type="number"
							class="cantidad"
							value={producto.cantidad}
							onchange={(e) => StorePedidoNuevo.pop(producto.id, Number(e.target.value))}
						/>
					</div>
				{/snippet}
			</ItemLista>
		{/each}
	</div>
{/if}

<!-- ACCIONES GLOBALES -->
{#if StorePedidoEditar.carrito.length == 0 && page.url.pathname != '/pedidos'}
	<button class="milk accion agregar-producto" onclick={() => goto('/pedidos')}
		>+Seleccionar Pedido</button
	>
	<p class="estado-vacio">No hay pedidos seleccionados</p>
{/if}
{#if StorePedidoNuevo.carrito.length == 0 && page.url.pathname != '/catalogo' && pedidosNoEditables.length == 0}
	<button class="milk accion agregar-producto" onclick={() => goto('/catalogo')}
		>+{StorePedidoEditar.carrito.length ? 'Agregar a Pedido' : 'Crear Pedido'}</button
	>
	<p class="estado-vacio">No hay productos seleccionados</p>
{/if}
{#if StorePedidoEditar.carrito.length > 0 || StorePedidoNuevo.carrito.length > 0}
	{#if puedeEditar}
		<p class="estado-vacio">El pedido se edita en la oportunidad</p>
	{/if}
	<div class="acciones-fijas">
		<button
			class="butter"
			onclick={actualizarPedido}
			disabled={actualizando || !puedeEditar || invalidoPorMoneda}
		>
			{actualizando ? 'Actualizando...' : 'Guardar Cambios'}
		</button>
	</div>
{/if}

<style>
	.encabezado {
		display: flex;
		align-items: center;
		gap: var(--y);
		margin-bottom: var(--b);
	}
	.encabezado .acciones {
		flex-grow: 1;
		display: flex;
		justify-content: flex-end;
		gap: var(--y);
	}
	.encabezado .titulo {
		flex-grow: 1;
	}
	.contenedor-grupo {
		padding: var(--a);
		display: flex;
		flex-direction: column;
		gap: var(--a);
	}

	/* tarjeta pedido */

	.enlaces {
		font-size: small;
	}
	.total {
		display: flex;
		justify-content: flex-end;
	}
	.producto {
		display: flex;
		justify-content: space-between;
	}
	.contador {
		display: flex;
		gap: var(--a);
		align-items: baseline;
	}
	.agregar-producto {
		border: 1px dashed var(--color-secondary);
		background-color: transparent;
		align-self: center;
	}
	input {
		max-width: var(--f);
	}
	/* inputs */
	.input-moneda {
		position: relative;
		display: flex;
		align-items: center;
	}

	.input-moneda .simbolo {
		position: absolute;
		left: 10px;
		pointer-events: none;
		z-index: 1;
	}

	.input-moneda input {
		padding-left: 24px;
		width: 100%;
	}

	/* Acciones inferiores */
	.resumen-grupo {
		display: flex;
		flex-wrap: wrap;
		justify-content: flex-end;
		align-items: center;
		gap: var(--a);
		margin: var(--b) 0;
	}
	.acciones-fijas {
		position: sticky;
		bottom: var(--a);
		display: flex;
		align-self: flex-end;
		gap: var(--y);
	}
	.estado-vacio {
		text-align: center;
		color: #94a3b8;
		font-style: italic;
		margin-bottom: 1rem;
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
</style>
