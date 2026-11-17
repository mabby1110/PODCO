<!-- SelecciónCotizacion.svelte -->
<script lang="ts">
	import { StoreCotizado } from '$lib/stores/pedidos/StorePedidoOportunidad.svelte';
	import { onMount } from 'svelte';
	import SubirCotizacion from '../Documentos/SubirCotizacion.svelte';
	import { fasesPedido } from '$lib';
	import { StorePedidoEditar } from '$lib/stores/pedidos/StorePedidoEditar.svelte';
	import { StorePedidoNuevo } from '$lib/stores/pedidos/StorePedidoNuevo.svelte';
	import { StoreContextoRelacion } from '$lib/stores/pedidos/StoreContextoRelacion.svelte';
	import { goto } from '$app/navigation';
	import { StoreAplicacion } from '$lib/stores/app/StoreAplicacion.svelte';
	import ItemLista from '$lib/components/Tarjetas/ItemLista.svelte';

	let {
		oportunidad,
		editando,
		disable
	}: { oportunidad: any; editando?: boolean; disable?: boolean } = $props();

	// DATOS DERIVADOS
	let potencial_venta = $derived(oportunidad.pedidos.filter((p) => p.id_cotizacion == null));
	const grupos = $derived(
		Object.values(
			oportunidad.pedidos.reduce((acc, pedido) => {
				const nombre_grupo = pedido.id_agrupacion || 'Sin grupo';

				if (!acc[nombre_grupo]) {
					acc[nombre_grupo] = {
						nombre_grupo,
						grupo: []
					};
				}

				acc[nombre_grupo].grupo.push(pedido);

				return acc;
			}, {})
		)
	);
	let total = $derived(
		oportunidad.pedidos.reduce(
			(acc, pedido) => acc + (pedido.id_cotizacion ? 0 : pedido.precio_unitario * pedido.cantidad),
			0
		)
	);

	let pedidoACotizarInvalido = $derived(
		oportunidad.pedidos.some(
			(p) =>
				StoreCotizado.carrito.some((item) => item.id === p.id) &&
				(p.precio_unitario === null || p.precio_unitario === undefined || p.precio_unitario === 0)
		)
	);

	let pedidoACotizarInvalidoPorMoneda = $derived(
		oportunidad.pedidos.some((p) => p.moneda == 'USD') &&
			oportunidad.pedidos.some((p) => p.moneda == 'MX')
	);

	// ESTADOS DEL COMPONENTE
	let expandidos = $state<Record<string, boolean>>({});

	// ACCIONES
	function seleccionarPedido(id: string) {
		if (StoreCotizado.carrito.some((item) => item.id === id)) {
			StoreCotizado.pop(id);
		} else {
			StoreCotizado.push(id);
		}
	}

	function seleccionarPedidoCompleto(agrupacion: any) {
		StoreCotizado.pushLista(agrupacion);
	}

	// HELPERS
	const formatMoneda = (val: number | null | undefined, moneda: string = 'USD') => {
		if (val == null || moneda == null) return 'Sin precio';
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
		StoreAplicacion.set('modal_editar_pedido', true);
	}

	onMount(() => {
		console.log(
			'Tarjeta potencial de ventra',
			oportunidad.pedidos.filter((p) => p.id_cotizacion)
		);
		StoreCotizado.limpiar();
	});
</script>
{#each grupos as agrupacion}
    {@const algunSeleccionadoEnGrupo = agrupacion.grupo.some((pedido) => 
        StoreCotizado.carrito.some((item) => item.id === pedido.id)
    )}

    <div class="pan honey pedido">
        <div class="badge" style={fasesPedido[2]?.estilo}>
            <span>Potencial de Venta</span>
        </div>
        
        {#each agrupacion.grupo as pedido (pedido.id)}
            {@const seleccionado = StoreCotizado.carrito.some((item) => item.id === pedido.id)}

            <ItemLista onclick={() => seleccionarPedido(pedido.id)}>
                {#snippet acciones()}
                    <input class="milk accion" type="checkbox" checked={seleccionado} />
                {/snippet}

                {#snippet titulo()}
                    <strong class="codigo">{pedido.catalogo?.codigo || 'Sin código'}</strong>
                    <b class="subtotal">
                         {formatMoneda(pedido.precio_unitario * pedido.cantidad, pedido.moneda)}
                    </b>
                {/snippet}

                {#snippet contenido()}
                    <span class="ref" class:text-danger={pedido.ref == null}>
                        {pedido.ref}
                    </span>
                    <span class="precio" class:text-danger={pedido.precio_unitario == null}>
                        {pedido.cantidad} x {formatMoneda(pedido.precio_unitario, pedido.moneda)}
                    </span>
                {/snippet}
            </ItemLista>
        {/each}

        {#if pedidoACotizarInvalidoPorMoneda}
            <p>no se pueden mezclar USD con MX</p>
        {:else}
            <h1 class="total"><b>{formatMoneda(total)}</b></h1>
        {/if}

        {#if potencial_venta.length === 0}
            <p class="estado-vacio">No hay pedidos pendientes por cotizar en esta oportunidad.</p>
        {/if}

        <div class="acciones-panel">
            {#if !disable}
                <!-- ⬇ AQUÍ SE CAMBIA LA CONDICIÓN ⬇ -->
                {#if algunSeleccionadoEnGrupo}
                    {#if pedidoACotizarInvalido}
                        <button class="alerta-error" onclick={editarPedido}>
                            <strong>Atención:</strong>
                            <u>Uno o más pedidos seleccionados no tienen precio unitario. Presiona para editar.</u>
                        </button>
                    {:else}
                        <SubirCotizacion
                            tipo="docs_cotizaciones"
                            action="/documentos?/subirCotizacion"
                            oportunidad={{
                                id: oportunidad?.id,
                                cliente:
                                    oportunidad?.clientes.nombre_comercial || oportunidad?.clientes.razon_social
                            }}
                            required
                        />
                    {/if}
                {:else if potencial_venta.length > 0}
                    <div class="acciones-fijas">
                        <button class="butter accion" onclick={editarPedido} title="Editar pedido">
                            <img src="/editar.svg" alt="Cotizar" />
                        </button>
                        <button
                            class="butter accion"
                            onclick={()=>seleccionarPedidoCompleto(agrupacion.grupo)}
                            title="Seleccionar todo para cotizar"
                        >
                            <img src="/avanzar-fase.svg" alt="Cotizar" />
                        </button>
                    </div>
                {/if}
            {/if}
        </div>
    </div>
{/each}

<style>
	.total {
		text-align: end;
	}
	.acciones-fijas {
		display: flex;
		justify-self: flex-end;
	}
</style>
