<script lang="ts">
	import { StorePedidoEditar } from '$lib/stores/pedidos/StorePedidoEditar.svelte';
	import { fasesPedido } from '$lib';
	import { StoreContextoRelacion } from '$lib/stores/pedidos/StoreContextoRelacion.svelte';
	import { StoreAplicacion } from '$lib/stores/app/StoreAplicacion.svelte';
	import ItemLista from '$lib/components/Tarjetas/ItemLista.svelte';
	import { formatMoneda } from '$lib/utils/util';

	let { pedidos, disable }: { pedidos: any; disable?: boolean } = $props();

	// Datos derivados
	let pedidosAgrupados = $derived.by(() => {
		const grupos = pedidos.reduce(
			(acc, pedido) => {
				const clave = pedido.id_agrupacion || 'sin_agrupar';

				if (!acc[clave]) {
					acc[clave] = {
						clave,
						id_agrupacion: new Set<string>(),
						oportunidades: new Map<string, any>(),
						pedidos: [],
						totalGrupo: 0
					};
				}

				// Agregar id_agrupacion solo si existe
				if (pedido.id_agrupacion) {
					acc[clave].id_agrupacion.add(pedido.id_agrupacion);
				}

				// Agregar objeto oportunidad sin duplicados (usando su id como llave)
				if (pedido.oportunidades?.id) {
					acc[clave].oportunidades.set(pedido.oportunidades.id, pedido.oportunidades);
				}

				acc[clave].pedidos.push(pedido);
				acc[clave].totalGrupo += (pedido.precio_unitario || 0) * (pedido.cantidad || 0);

				return acc;
			},
			{} as Record<
				string,
				{
					clave: string;
					id_agrupacion: Set<string>;
					oportunidades: Map<string, any>;
					pedidos: any[];
					totalGrupo: number;
				}
			>
		);

		// Convertir Set y Map a Arrays para usarlos fácil en el template
		return Object.values(grupos).map((grupo) => ({
			...grupo,
			id_agrupacion: Array.from(grupo.id_agrupacion),
			oportunidad: Array.from(grupo.oportunidades.values())
		}));
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

	// ACCIONES
	function editarPedido(id: string, id_oportunidad: string) {
		if (disable) return;
		StorePedidoEditar.push(id);
		StorePedidoEditar.toggleModal(true);
		StoreAplicacion.set('modal_editar_pedido', true);
		if (id_oportunidad) {
			StoreContextoRelacion.setOportunidad(id_oportunidad);
		}
	}
	function editarPedidoCompleto(grupo: any) {
		StoreAplicacion.set('modal_editar_pedido', true);
		StorePedidoEditar.pushLista(grupo);
		if (oportunidades.length === 1) {
			StoreContextoRelacion.setOportunidad(oportunidades[0]);
		}
	}

	// estados del componente
	let actualizando = $state(false);
</script>

{#each pedidosAgrupados as grupo}
	<div class="contenedor-lista">
		<div class="contenido-lista milk">
			<div class="meta-lista">
				{#if grupo.id_agrupacion.length > 0}
					<p class="agrupacion-titulo">
						Grupo: {grupo.id_agrupacion.join(', ')}
					</p>
				{/if}

				{#if grupo.oportunidad.length > 0}
					<div class="oportunidades-lista">
						{#each grupo.oportunidad as op (op.id)}
							<span>
								{op.id} - {op.clientes?.nombre_comercial || op.clientes?.razon_social}
							</span>
						{/each}
					</div>
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
							<p>
								{pedido.catalogo.descripcion || 'Sin descripción'}
							</p>
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
