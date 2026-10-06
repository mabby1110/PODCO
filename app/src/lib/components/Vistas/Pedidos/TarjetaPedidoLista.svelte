<script lang="ts">
	import { StorePedidoEditar } from '$lib/stores/pedidos/StorePedidoEditar.svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { fasesPedido } from '$lib';
	import { StoreContextoRelacion } from '$lib/stores/pedidos/StoreContextoRelacion.svelte';

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
	let oportunidades = $derived(pedidos.filter(p=>p.id_oportunidad!=null));
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
	    StorePedidoEditar.toggleModal(true);
	}

	// estados del componente
	let expandidos = $state<Record<string, boolean>>({});
	let actualizando = $state(false);
	let mensaje = $state('');

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
		<div class="meta-titulo">
			{#if grupo.id_agrupacion !== 'sin_agrupar'}
				<p class="agrupacion-titulo">Grupo: {grupo.id_agrupacion}</p>
			{/if}
		</div>
		<div class="lista">
			{#each grupo.pedidos as pedido (pedido.id)}
				<div class="contenedor-pedido">
					<!-- svelte-ignore a11y_click_events_have_key_events -->
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<div class="tarjeta honey" onclick={() => editarPedido(pedido.id, pedido.id_oportunidad)}>
						<div class="titulo">
							<div class="badge" style={fasesPedido[pedido.fase]?.estilo}>
								<span>{fasesPedido[pedido.fase]?.actual}</span>
							</div>
							<strong>
								{pedido.catalogo.codigo || 'Sin código'}
							</strong>
						</div>

						<div class="contenido">
							<span class="precio" class:text-danger={pedido.precio_unitario == null}>
								{pedido.cantidad} x
								{formatMoneda(pedido.precio_unitario, pedido.moneda)}
							</span>
						</div>

						<div class="resumen">
							<b class="subtotal">
								{formatMoneda(
									(pedido.precio_unitario || 0) * (pedido.cantidad || 0),
									pedido.moneda
								)}
							</b>
						</div>
					</div>
					<div class="meta-titulo">
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
				</div>
			{/each}

			<div class="total">
				<h1>
					<b>{formatMoneda(grupo.totalGrupo)}</b>
				</h1>
			</div>
		</div>
		{#if !disable}
			<div class="acciones-panel">
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
						onclick={()=>editarPedidoCompleto(grupo.pedidos)}
					>
						Seleccionar
					</button>
				</div>
			</div>
		{/if}
	</div>
{/each}

<style>
	.contenedor-lista {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding: 16px;
		border: 2px solid var(--color-muted);
		border-radius: var(--b);
	}

	.lista {
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
	.contenedor-pedido {
		height: fit-content;
	}
	.tarjeta.invalid {
		border-radius: 8px;
		background: #fff7f7;
		outline: 1px solid #fca5a5;
		padding: 0.5rem;
	}

	.meta-titulo {
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
		font-size: small;
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
