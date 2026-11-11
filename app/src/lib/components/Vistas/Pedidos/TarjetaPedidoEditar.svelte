<!-- VistaEditorPedidos.svelte -->
<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { page } from '$app/state';
	import BindableSelect from '$lib/components/Formularios/BindableSelect.svelte';
	import FormSelectMotivo from '$lib/components/Formularios/FormSelectMotivo.svelte';
	import Select from '$lib/components/Formularios/Select.svelte';
	import TarjetaLista from '$lib/components/Tarjetas/TarjetaLista.svelte';
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
	let oportunidades = $derived(
		Array.from(
			new Set(pedidos.map((p) => p.id_oportunidad).filter((id): id is string => id != null))
		)
	);
	let idAgrupaciones = $derived([
		...new Set(pedidos.map((pedido) => pedido.id_agrupacion).filter(Boolean))
	]);

	// ESTADOS
	let actualizando = $state(false);
	let mensaje = $state('');
	let expandidos = $state<Record<string, boolean>>({});
	let pedidoACotizarInvalidoPorMoneda = $derived(
		pedidos.some((p) => p.moneda == 'USD') && pedidos.some((p) => p.moneda == 'MX')
	);

	// ACCIONES
	async function limpiarCarritoCompleto() {
		StorePedidoEditar.limpiar();
		StorePedidoNuevo.limpiar();
		StoreContextoRelacion.limpiar();
	}
	async function actualizarPedido() {
		actualizando = true;
		mensaje = '';
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

				mensaje = 'Pedido actualizado correctamente';
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
				mensaje = error instanceof Error ? error.message : 'Error al crear pedido';
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

				if (idAgrupaciones.length == 1) {
					formData.append('pedidosACrear', JSON.stringify(productos));
				}

				if (StoreContextoRelacion.id_oportunidad) {
					formData.append('idOportunidad', StoreContextoRelacion.id_oportunidad);
				}

				const response = await fetch('/pedidos?/actualizarPedido', {
					method: 'POST',
					body: formData
				});
				const result = await response.json();

				if (!response.ok || result?.type === 'failure') {
					throw new Error(result?.data?.error || result?.error || 'Error al actualizar el pedido');
				}

				mensaje = 'Pedido actualizado correctamente';
				const idOportunidad = StoreContextoRelacion.id_oportunidad;

				if (idOportunidad) {
					await goto(`/oportunidades/${idOportunidad}`);
				}
				limpiarCarritoCompleto();
				invalidateAll();
			} catch (error) {
				console.error('Error al actualizar pedido:', error);
				mensaje = error instanceof Error ? error.message : 'Error al actualizar el pedido';
			} finally {
				actualizando = false;
				await goto(`/pedidos`);
			}
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
			StoreContextoRelacion.limpiar();
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
	console.log(oportunidades);
</script>

<!-- pedidos a editar -->
{#if StorePedidoEditar.carrito.length > 0}
	<div class="contenedor-grupo milk">
		{#each pedidos as pedido (pedido.id)}
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<TarjetaLista>
				{#snippet metaAcciones()}
					<button class="jelly rojo" onclick={() => StorePedidoEditar.pop(pedido.id)}>✕</button>
				{/snippet}
				{#snippet titulo()}
					<strong class="codigo">{pedido.catalogo?.codigo || 'Sin código'}</strong>
					<div class="enlaces">
						{#if pedido.id_oportunidad}
							<a href="/oportunidades/{pedido.id_oportunidad}" onclick={(e) => e.stopPropagation()}>
								Op {pedido.oportunidades?.clientes?.razon_social ||
									pedido.oportunidades?.clientes?.nombre_comercial}
							</a>
						{/if}
					</div>
				{/snippet}
				{#snippet input()}
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
					<BindableSelect
						bind:value={pedido.ref}
						list={['FASTRAQ', 'Lista de precios']}
						name="ref"
						placeholder="De donde se obtiene precio"
					/>
				{/snippet}
				{#snippet resumen()}
					<div class="resumen-pedido">
						<b class="subtotal">${pedido.precio_unitario * pedido.cantidad}</b>
					</div>
				{/snippet}
			</TarjetaLista>
		{/each}
		<div class="resumen-grupo">
			{#if pedidoACotizarInvalidoPorMoneda}
				<p>no se pueden mezclar USD con MX</p>
			{:else}
				<select class="input-s" title="Moneda">
					<option value="MXN">MXN</option>
					<option value="USD">USD</option>
				</select>
				<h1 class="total"><b>{formatMoneda(total)}</b></h1>
			{/if}
		</div>
	</div>
	<div class="acciones-fijas">
		<button
			class="butter"
			type="button"
			aria-label="Limpiar"
			title="Limpiar"
			onclick={limpiarCarritoCompleto}
		>
			<img src="/clean.svg" alt="Elimininar relacion" />
		</button>
		{#if StorePedidoEditar.carrito.length > 0}
			<button
				class="butter accion rojo"
				onclick={eliminarRelacion}
				aria-label="Eliminar relación"
				title="Eliminar relación"
			>
				<img src="/remove.svg" alt="Elimininar relacion" />
			</button>
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
			<TarjetaLista>
				{#snippet input()}
					<div class="producto">
						<div class="contador">
							<input
								type="number"
								class="cantidad"
								value={producto.cantidad}
								onchange={(e) => StorePedidoNuevo.pop(producto.id, Number(e.target.value))}
							/>
						</div>
					</div>
				{/snippet}
				{#snippet titulo()}
					<span class="codigo">{producto.producto.descripcion}</span>
					<span class="codigo">{producto.producto.codigo}</span>
				{/snippet}
			</TarjetaLista>
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
{#if StorePedidoNuevo.carrito.length == 0 && page.url.pathname != '/catalogo'}
	<button class="milk accion agregar-producto" onclick={() => goto('/catalogo')}
		>+{StorePedidoEditar.carrito.length ? 'Agregar a Pedido' : 'Crear Pedido'}</button
	>
	<p class="estado-vacio">No hay productos seleccionados</p>
{/if}
{#if StorePedidoEditar.carrito.length > 0 || StorePedidoNuevo.carrito.length > 0}
	<div class="acciones-fijas">
		<button class="butter" onclick={actualizarPedido} disabled={actualizando}>
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
		flex-grow: 1;
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
		justify-content: space-between;
		flex-wrap: wrap;
		margin: var(--b);
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
</style>
