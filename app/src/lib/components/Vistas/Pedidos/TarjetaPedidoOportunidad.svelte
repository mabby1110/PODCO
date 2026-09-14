<!-- SelecciónCotizacion.svelte -->
<script lang="ts">
    import { StorePedidoOportunidad } from '$lib/stores/pedidos/StorePedidoOportunidad.svelte';
    import { onMount } from 'svelte';
    import SubirCotizacion from '../Documentos/SubirCotizacion.svelte';
    import { fasesPedido } from '$lib';

    let { oportunidad } = $props();

    onMount(() => {
        StorePedidoOportunidad.limpiar();
    });

    // DATOS DERIVADOS
    let potencial_venta = $derived(oportunidad.pedidos.filter((p) => p.id_cotizacion == null));
    
    let pedidoACotizarInvalido = $derived(
        oportunidad.pedidos.some((p) =>
            StorePedidoOportunidad.carrito.some((item) => item.id === p.id) && 
            (p.precio_unitario === null || p.precio_unitario === undefined)
        )
    );

    $effect(() => console.log('¿Selección inválida?:', oportunidad.pedidos));

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
        StorePedidoOportunidad.pushLista(potencial_venta);
    }

    // HELPERS
    const formatMoneda = (val: number | null | undefined, moneda: string = 'MXN') => {
        if (val == null) return 'Sin precio';
        return new Intl.NumberFormat('es-MX', { style: 'currency', currency: moneda }).format(val);
    };

    const formatFecha = (iso: string) =>
        new Intl.DateTimeFormat('es-MX', { dateStyle: 'short' }).format(new Date(iso));
</script>

<div class="cotizacion-container">
    <div class="lista-tarjetas">
        {#each potencial_venta as pedido (pedido.id)}
            {@const seleccionado = StorePedidoOportunidad.carrito.some((item) => item.id === pedido.id)}
            
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div 
                class="card" 
                class:selected={seleccionado} 
                class:invalid={seleccionado && pedido.precio_unitario == null}
                onclick={() => seleccionarPedido(pedido.id)}
            >
                <!-- Header: Código, Estatus y Checkbox visual -->
                <header class="row justify-between">
                    <div class="row">
                        <div class="checkbox" class:checked={seleccionado}></div>
                        <strong class="codigo">{pedido.catalogo?.codigo || 'Sin código'}</strong>
                    </div>
                    {#if fasesPedido && pedido.estatus !== undefined}
                        <span class="badge" style={fasesPedido[pedido.estatus]?.estilo}>
                            {fasesPedido[pedido.estatus]?.actual}
                        </span>
                    {/if}
                </header>

                <!-- Fila 2: Metadatos principales -->
                <div class="row info-principal justify-between">
                    <span class="fecha">{formatFecha(pedido.fecha_creacion)}</span>
                    <span class="precio" class:text-danger={pedido.precio_unitario == null}>
                        {pedido.cantidad} x {formatMoneda(pedido.precio_unitario, pedido.moneda)}
                    </span>
                </div>

                <!-- Sección Colapsable: Leer Más -->
                {#if pedido.catalogo?.descripcion || pedido.catalogo?.caracteristicas}
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
                                    <p class="desc"><strong>Necesidades:</strong> {pedido.oportunidades.necesidades}</p>
                                {/if}
                            </div>
                            <button class="link-btn" onclick={(e) => { e.stopPropagation(); expandidos[pedido.id] = false; }}>
                                Ocultar detalles
                            </button>
                        {:else}
                            <button class="link-btn" onclick={(e) => { e.stopPropagation(); expandidos[pedido.id] = true; }}>
                                Leer más detalles...
                            </button>
                        {/if}
                    </div>
                {/if}
            </div>
        {/each}

        {#if potencial_venta.length === 0}
            <p class="estado-vacio">No hay pedidos pendientes por cotizar en esta oportunidad.</p>
        {/if}
    </div>

    <!-- Área de Acciones / Subida -->
    <div class="acciones-panel">
        {#if StorePedidoOportunidad.carrito.length > 0}
            {#if pedidoACotizarInvalido}
                <div class="alerta-error">
                    <strong>Atención:</strong> Uno o más pedidos seleccionados no tienen precio unitario. Edítalos antes de cotizar.
                </div>
            {:else}
                <div class="subir-wrapper">
                    <SubirCotizacion
                        tipo="docs_cotizaciones"
                        action="/documentos?/subirCotizacion"
                        oportunidad={{
                            id: oportunidad?.id,
                            cliente: oportunidad?.clientes.nombre_comercial || oportunidad?.clientes.razon_social
                        }}
                        required
                    />
                </div>
            {/if}
        {:else if potencial_venta.length > 0}
            <div class="acciones-fijas">
                <button class="butter variant-primary" onclick={seleccionarPedidoCompleto}>
                    Seleccionar todo para cotizar
                </button>
            </div>
        {/if}
    </div>
</div>

<style>
    .cotizacion-container {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .lista-tarjetas {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    .card {
        background: #ffffff;
        border: 2px solid #e2e8f0;
        border-radius: 6px;
        padding: 0.75rem 1rem;
        font-size: 0.875rem;
        color: #334155;
        cursor: pointer;
        transition: all 0.2s ease-in-out;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .card:hover {
        border-color: #cbd5e1;
    }

    /* Estilos de Selección */
    .card.selected {
        border-color: #3b82f6;
        background-color: #eff6ff;
    }
    
    .card.invalid {
        border-color: #ef4444;
        background-color: #fef2f2;
    }

    .checkbox {
        width: 16px;
        height: 16px;
        border: 2px solid #cbd5e1;
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
        content: "";
        width: 4px;
        height: 8px;
        border: solid white;
        border-width: 0 2px 2px 0;
        transform: rotate(45deg);
        margin-bottom: 2px;
    }

    .row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .justify-between { justify-content: space-between; }
    .codigo { font-size: 0.95rem; color: #0f172a; }
    
    .badge {
        font-size: 0.7rem;
        padding: 0.1rem 0.4rem;
        border-radius: 99px;
        background: #f1f5f9;
        font-weight: 600;
    }

    .info-principal { color: #475569; }
    .fecha { font-size: 0.85rem; }
    
    .precio {
        font-weight: 600;
        color: #059669;
    }
    .text-danger { color: #ef4444; }

    /* Detalles expandibles */
    .detalles {
        margin-top: 0.25rem;
        padding-top: 0.25rem;
        border-top: 1px dashed #cbd5e1;
    }
    .contenido-expandido {
        background: rgba(255,255,255,0.6);
        padding: 0.5rem;
        border-radius: 4px;
        margin-bottom: 0.5rem;
    }
    .desc { margin: 0 0 0.4rem 0; font-size: 0.8rem; }
    .jsonb pre { margin: 0; font-size: 0.75rem; white-space: pre-wrap; color: #475569; }
    .link-btn {
        background: none; border: none; color: #3b82f6;
        font-size: 0.8rem; padding: 0; cursor: pointer; text-decoration: underline;
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

    .subir-wrapper {
        background: #f8fafc;
        border: 1px dashed #cbd5e1;
        padding: 1rem;
        border-radius: 6px;
    }

    .estado-vacio { text-align: center; color: #94a3b8; font-style: italic; margin-top: 1rem; }

    .butter {
        padding: 0.5rem 1rem; border-radius: 6px; font-size: 0.875rem; font-weight: 500; cursor: pointer; border: none;
    }
    .variant-primary { background: #2563eb; color: white; }
    .variant-primary:hover { background: #1d4ed8; }
</style>