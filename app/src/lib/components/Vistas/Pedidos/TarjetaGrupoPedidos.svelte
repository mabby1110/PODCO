<script lang="ts">
	import { StorePedidoEditar } from '$lib/stores/pedidos/StorePedidoEditar.svelte';
	import { goto } from '$app/navigation';
	import { fasesPedido } from '$lib';
	import { StoreContextoRelacion } from '$lib/stores/pedidos/StoreContextoRelacion.svelte';
	import { StoreAplicacion } from '$lib/stores/app/StoreAplicacion.svelte';
	import ItemLista from '$lib/components/Tarjetas/ItemLista.svelte';

	let { pedidos, disable }: { pedidos: any; disable?: boolean } = $props();

	// Datos derivados
	let pedidosAgrupados = $derived.by(() => {
		const grupos = pedidos.reduce(
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
				acc[clave].totalGrupo += (pedido.precio_unitario || 0) * (pedido.cantidad || 0);

				return acc;
			},
			{} as Record<
				string,
				{
					id_agrupacion: string;
					pedidos: [];
					totalGrupo: number;
				}
			>
		);

		return Object.values(grupos);
	});
	let oportunidades = $derived(
		Array.from(
			new Set(
				pedidos
					.filter((p) => StorePedidoEditar.carrito.find((s) => s.id == p.id))
					.map((p) => p.id_oportunidad)
					.filter((id): id is string => id != null)
			)
		)
	);

	console.log('oportunidades', oportunidades);

	// ACCIONES
	function editarPedido(id: string, id_oportunidad: string) {
		if (disable) return;
		StorePedidoEditar.push(id);
		StorePedidoEditar.toggleModal(true);
		if (id_oportunidad) {
			StoreContextoRelacion.setOportunidad(id_oportunidad);
		}
	}
	function editarPedidoCompleto(pedidos: any) {
		goto('/pedidos');
		StorePedidoEditar.pushLista(pedidos);
		StoreAplicacion.set('modal_editar_pedido', true);
		console.log(oportunidades);
		if (oportunidades.length === 1) {
			StoreContextoRelacion.setOportunidad(oportunidades[0]);
		}
	}

	// estados del componente
	let actualizando = $state(false);

	// helpers
	const formatMoneda = (val: number | null | undefined, moneda: string = 'USD') => {
		if (val == null) return 'Sin precio';

		return new Intl.NumberFormat('es-MX', {
			style: 'currency',
			currency: moneda,
			currencyDisplay: 'narrowSymbol'
		}).format(val);
	};

	$effect(() => console.log(pedidosAgrupados));
</script>

{#each pedidosAgrupados as grupo}
	<div class="contenedor-lista">
		<div class="contenido-lista milk">
			<div class="meta-lista">
				{#if grupo.id_agrupacion !== 'sin_agrupar'}
					<p class="agrupacion-titulo">Grupo: {grupo.id_agrupacion}</p>
				{/if}
			</div>
			<div class="lista">
				{#each grupo.pedidos as pedido (pedido.id)}
					<ItemLista>
						{#snippet acciones()}
							<button
								class="badge"
								style={fasesPedido[pedido.fase]?.estilo}
								onclick={() => editarPedido(pedido.id, pedido.id_oportunidad)}
							>
								<span>{fasesPedido[pedido.fase]?.actual}</span>
							</button>
						{/snippet}
						{#snippet meta()}
							<div class="meta-tarjeta">
								<span>
									{pedido.oportunidades?.id}
								</span>
								<span>
									{pedido.oportunidades?.clientes?.nombre_comercial ||
										pedido.oportunidades?.clientes?.razon_social}
								</span>
								<span>
									{pedido.oportunidades?.motivo}
								</span>
							</div>
						{/snippet}
						{#snippet titulo()}
							<div class="titulo">
								<strong>
									{pedido.catalogo.codigo || 'Sin código'}
								</strong>
							</div>
						{/snippet}
						{#snippet contenido()}
							<span class="precio" class:text-danger={pedido.precio_unitario == null}>
								{pedido.cantidad} x
								{formatMoneda(pedido.precio_unitario, pedido.moneda)}
							</span>
							<b class="subtotal">
								{formatMoneda(
									(pedido.precio_unitario || 0) * (pedido.cantidad || 0),
									pedido.moneda
								)}
							</b>
						{/snippet}
					</ItemLista>
				{/each}

				<div class="total">
					<h1>
						<b>{formatMoneda(grupo.totalGrupo)}</b>
					</h1>
				</div>
			</div>
		</div>

		{#if !disable}
			<div class="acciones-lista">
				<div class="occ-wrapper">
					<!-- <div class="alerta-error">
					nada
					</div> -->

					<!-- {#if puedeSubirOcc}
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
					{/if} -->
				</div>
				<div class="acciones-fijas">
					<button
						class="butter"
						type="button"
						disabled={actualizando}
						onclick={() => editarPedidoCompleto(grupo.pedidos)}
					>
						Seleccionar
					</button>
				</div>
			</div>
		{/if}
	</div>
{/each}

<style>
	.contenido-lista {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding: 16px;
	}

	.lista {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}
	.meta-lista {
		display: flex;
		gap: var(--a);
		flex-wrap: wrap;
		align-items: baseline;
		font-size: small;
	}

	.total {
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: flex-end;
	}

	.text-danger {
		color: #ef4444;
	}

	.acciones-lista {
		margin-top: 0.5rem;
	}

	.acciones-fijas {
		display: flex;
		justify-content: flex-end;
		gap: var(--a);
	}

	button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
</style>
