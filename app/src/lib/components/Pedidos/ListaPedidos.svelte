<script lang="ts">
    import { page } from '$app/state';
    import { productosSeleccionadosStore } from '$lib/stores/productosSeleccionadosStore.svelte';
    import { agruparDatos } from '$lib/utils/filtro';
    import { formatCurrency } from '$lib/utils/util';

    let { view = $bindable() }: { view?: boolean } = $props();
    let { pedidos } = $derived(page.data);
    let lista = $derived(pedidos);
    let agrupacion = $state('id_agrupacion');
    let lista_agrupada = $derived(agruparDatos(lista, agrupacion));
    function handleEdit(elementos: any[]) {
        view = true;
        productosSeleccionadosStore.limpiar();
        
        elementos.forEach((item) => {
            if (item.id_agrupacion) {
                productosSeleccionadosStore.ruta = 'updatePedido';
                productosSeleccionadosStore.camposPermitidos = ['cantidad', 'precio_unitario'];
                
                // Se agrega consolidado para permitir la edición del bloque completo de cantidad
                productosSeleccionadosStore.agregar(item.inventario, item);
            } else {
                productosSeleccionadosStore.ruta = 'create';
                productosSeleccionadosStore.camposPermitidos = ['*'];

                const cantidad = item.inventario.cantidad || 1;
                for (let i = 0; i < cantidad; i++) {
                    productosSeleccionadosStore.agregar(item.inventario, item);
                }
            }
        });
    }

    const copiarAExcel = (elementos: any[]) => {
        const cabeceras = 'Cantidad\tCódigo\tDescripción\tSerie\tMoneda\tPrecio';
        const filas = elementos
            .map(
                (item) =>
                    `${item.inventario.cantidad || 0}\t${item.inventario.codigo || ''}\t${item.inventario.descripcion || ''}\t${item.inventario.serie || ''}\tUSD\t${item.inventario.precio || 0}`
            )
            .join('\n');

        navigator.clipboard.writeText(`${cabeceras}\n${filas}`);
    };
</script>

<div class="pedidos">
    {#each lista_agrupada as grupo}
        <div class="pedido panel">
            <div class="producto" style="font-weight: bold;">
                <span class="descripcion">Descripción</span>
                <span class="codigo">Código</span>
                <span>Moneda</span>
                <span class="cantidad">P/U</span>
                <span class="cantidad">Cantidad</span>
                <span class="total">total</span>
            </div>
            {#each grupo.elementos as item}
                <div class="producto">
                    <span class="descripcion">{item.inventario.descripcion || '-'}</span>
                    <span class="codigo">
                        {item.inventario.serie || item.inventario.codigo || 'sin código'}
                    </span>
                    <span>USD</span>
                    <span class="cantidad">
                        <p>{item.precio_unitario}</p>
                    </span>
                    <span class="cantidad">
                        {item.cantidad}
                    </span>
                    <span class="total">
                        {formatCurrency(String(item.precio_unitario * item.cantidad), 'USD')}
                    </span>
                </div>
            {/each}
            <div class="acciones-tabla">
                <button class="butter" type="button" onclick={() => copiarAExcel(grupo.elementos)}>
                    Copiar Datos
                </button>
                <button class="butter" type="button" onclick={() => handleEdit(grupo.elementos)}>
                    Editar
                </button>
            </div>
        </div>
    {/each}
</div>

<style>
    .pedidos {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(70px, 1fr));
        gap: var(--a);
    }
    .pedido {
        grid-column: span 6;
        background-color: var(--color-secondary);
    }
    .producto {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(35px, 1fr));
        gap: var(--a);
        align-items: baseline;
        justify-items: center;
    }
    .producto .descripcion {
        grid-column: span 5;
        word-break: break-all;
        justify-self: flex-start;
    }
    .producto .codigo,
    .producto .cantidad,
    .producto .total {
        grid-column: span 2;
        word-break: break-all;
    }
    .acciones-tabla {
        display: flex;
        gap: var(--a);
        position: sticky;
        bottom: 0;
    }
</style>