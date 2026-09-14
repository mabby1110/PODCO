<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { page } from '$app/state';
	import { StoreContextoRelacion } from '$lib/stores/pedidos/StoreContextoRelacion.svelte';
	import { StorePedidoEditar } from '$lib/stores/pedidos/StorePedidoEditar.svelte';
	import { StorePedidoNuevo } from '$lib/stores/pedidos/StorePedidoNuevo.svelte';

	let pedidos = $derived(
		page.data.pedidos.filter((p) => StorePedidoEditar.carrito.some((item) => item.id === p.id))
	);
	let productos = $derived(
		StorePedidoNuevo.carrito.map((item) => ({
			...item,
			producto: page.data.catalogo.find((p) => p.id === item.id)
		}))
	);

	// ESTADOS DEL COMPONENTE
	let actualizando = $state(false);
	let mensaje = $state('');
	let existeRelacionOportunidad = $derived(pedidos.some((p) => p.id_oportunidad != null));

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

	// CRUD DEL CARRITO
	let idAgrupaciones = $derived([
		...new Set(pedidos.map((pedido) => pedido.id_agrupacion).filter(Boolean))
	]);
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

			// se van a agregar productos al pedido
			if (idAgrupaciones.length == 1) {
				formData.append('pedidosACrear', JSON.stringify(productos));
			}

			// se ha seleccionado oportunidad a relacionar
			if (StoreContextoRelacion.id_oportunidad) {
				formData.append('idOportunidad', StoreContextoRelacion.id_oportunidad);
			}

			const response = await fetch('/pedidos?/editarBorrador', {
				method: 'POST',
				body: formData
			});

			const result = await response.json();

			if (!response.ok || result?.type === 'failure') {
				throw new Error(result?.data?.error || result?.error || 'Error al actualizar el pedido');
			}

			mensaje = 'Pedido actualizado correctamente';

			const idOportunidad = StoreContextoRelacion.id_oportunidad;

			console.log('finally:', idOportunidad);

			if (idOportunidad) {
				const ruta = `/oportunidades/${idOportunidad}`;
				console.log('navegando a:', ruta);

				await goto(ruta);
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

		if (!confirmar) {
			actualizando = false;
			return;
		}
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

			mensaje = 'Pedido actualizado correctamente';
			limpiarCarrito();
			invalidateAll();
		} catch (error) {
			console.error('Error al actualizar pedido:', error);
			mensaje = error instanceof Error ? error.message : 'Error al actualizar el pedido';
		} finally {
			actualizando = false;
		}
	}
	async function eliminarPedido(id_pedido: string) {
		try {
			const formData = new FormData();

			formData.append('id_pedido', id_pedido);

			const response = await fetch('/pedidos?/eliminar', {
				method: 'POST',
				body: formData
			});

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
		} finally {
			actualizando = false;
		}
	}
</script>

<div class="pedido">
	<!-- pedidos a editar -->
	{#each pedidos as pedido}
		<div>
			{#each Object.entries(pedido) as [clave, valor]}
				{#if clave === 'catalogo' && valor !== null}
					<div>
						<strong>catalogo:</strong>

						<div style="margin-left: 1rem;">
							{#each Object.entries(valor) as [catClave, catValor]}
								<div>
									<strong>{catClave}:</strong>
									{catValor}
								</div>
							{/each}
						</div>
					</div>
				{:else if clave === 'cantidad'}
					<div>
						<label>
							<strong>Cantidad:</strong>
							<input
								type="number"
								min="0"
								step="1"
								value={valor ?? 0}
								oninput={(event) =>
									actualizarCampo(pedido.id, 'cantidad', event.currentTarget.value)}
							/>
						</label>
					</div>
				{:else if clave === 'moneda'}
					<div>
						<label>
							<strong>Moneda:</strong>
							<select
								value={valor ?? 'MXN'}
								onchange={(event) =>
									actualizarCampo(pedido.id, 'moneda', event.currentTarget.value)}
							>
								<option value="MXN">MXN</option>
								<option value="USD">USD</option>
							</select>
						</label>
					</div>
				{:else if clave === 'precio_unitario'}
					<div>
						<label>
							<strong>Precio unitario:</strong>
							<input
								type="number"
								min="0"
								step="1"
								value={valor ?? 0}
								oninput={(event) =>
									actualizarCampo(pedido.id, 'precio_unitario', event.currentTarget.value)}
							/>
						</label>
					</div>
				{:else if clave === 'oportunidades' && valor !== null}
					<div>
						<strong>Oportunidad:</strong>

						<div style="margin-left: 1rem;">
							{#each Object.entries(valor) as [catClave, catValor]}
								<div>
									<strong>{catClave}:</strong>
									{catValor}
								</div>
							{/each}
						</div>
					</div>
				{:else if typeof valor !== 'object'}
					<div>
						<strong>{clave}:</strong>
						{valor}
					</div>
				{/if}
			{/each}

			<hr />

			<button class="butter" onclick={() => StorePedidoEditar.pop(pedido.id)}> Quitar </button>
			<button class="butter" onclick={() => eliminarPedido(pedido.id)}> Eliminar </button>
		</div>
	{/each}

	<!-- pedidos a crear -->
	{#if StorePedidoEditar.carrito.length > 0 && idAgrupaciones.length == 1}
		{#each productos as producto}
			<div class="item">
				<p>{producto.producto.codigo}</p>
				<button type="button" class="butter" onclick={() => StorePedidoNuevo.pop(producto.id)}>
					-
				</button>

				<span class="butter">{producto.cantidad}</span>

				<button type="button" class="butter" onclick={() => StorePedidoNuevo.push(producto.id)}>
					+
				</button>
			</div>
		{/each}
	{/if}

	<!-- acciones -->
	{#if StorePedidoEditar.carrito.length > 0}
		<div class="acciones">
			<button class="butter" onclick={limpiarCarrito}>Limpiar</button>
			{#if existeRelacionOportunidad}
				<button class="butter" onclick={() => eliminarRelacion()}> Eliminar Relacion </button>
			{/if}
			<button class="butter" onclick={editarBorrador} disabled={actualizando}>
				{actualizando ? 'Actualizando...' : 'Actualizar pedido'}
			</button>
		</div>
	{:else}
		<p>No hay pedidos seleccionados</p>
	{/if}

	{#if mensaje}
		<p>{mensaje}</p>
	{/if}
</div>

<style>
	.pedido {
		display: flex;
		flex-direction: column;
	}
	.acciones {
		position: sticky;
		bottom: var(--a);
		display: flex;
		justify-content: flex-end;
		padding: var(--a);
	}
</style>
