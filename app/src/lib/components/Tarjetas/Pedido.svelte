<script lang="ts">
    import { invalidateAll } from '$app/navigation';
    import { StoreEditarPedido } from '$lib/stores/StoreEditarPedido.svelte';
    import { formatCurrency } from '$lib/utils/util';

    let { item, editando, hot }: { item: any; editando?: boolean; hot?: boolean } = $props();
    let cantidad = $state(item.cantidad || 0);
    let precio_unitario = $state(item.precio_unitario || 0);

    let total = $derived(formatCurrency(String(precio_unitario * cantidad), 'USD'));
    let isSubmitting = $state(false);

    async function removerItem(item: any) {
        if (item.id_oportunidad) {
            const formData = new FormData();
            formData.append(
                'pedidosAActualizar',
                JSON.stringify([{ id: item.id, id_oportunidad: null }])
            );
            const response = await fetch('/pedidos?/updatePedido', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                item.id_oportunidad = null;
                StoreEditarPedido.remover(item);
                invalidateAll();
            }
        } else {
            StoreEditarPedido.remover(item);
        }
    }

    async function guardarItem() {
        isSubmitting = true;
        try {
            const formData = new FormData();
            const { agente, inventario, ...pedidoAActualizar } = item;
            pedidoAActualizar.cantidad = cantidad;
            pedidoAActualizar.precio_unitario = precio_unitario;
            formData.append('pedidosAActualizar', JSON.stringify([pedidoAActualizar]));
            
            const response = await fetch('/pedidos?/updatePedido', {
                method: 'POST',
                body: formData
            });

            if (response.ok) invalidateAll();
        } finally {
            isSubmitting = false;
        }
    }
</script>

<div class="pedido">
    {#if editando}
        <button type="button" class="butter milk" onclick={() => removerItem(item)}>✕</button>

        <div class="descripcion">
            <b>{item.inventario?.descripcion || '-'}</b>
            <a href="/oportunidades/{item.id_oportunidad}">{item.id_oportunidad}</a>
        </div>
        <span class="codigo">{item.inventario?.serie || item.inventario?.codigo || 'sin código'}</span>

        <input type="number" bind:value={cantidad} min="1" />
        <div class="precio">
            $<input type="number" bind:value={precio_unitario} step="0.01" />
        </div>
    {:else}
        <div class="descripcion">
            <b>{item.inventario?.descripcion || '-'}</b>
            <a href="/oportunidades/{item.id_oportunidad}">{item.id_oportunidad}</a>
        </div>
        <span class="codigo">{item.inventario?.serie || item.inventario?.codigo || 'sin código'}</span>
        <span class="precio">{cantidad}</span>
        <span><p>${precio_unitario || 0}</p></span>
    {/if}

    <span>USD</span>
    <span class="total">{total}</span>
    {#if hot && editando}
        <button type="button" class="butter matcha submit" disabled={isSubmitting} onclick={guardarItem}>Guardar</button>
    {/if}
</div>

<style>
    .pedido {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(var(--d), 1fr));
        gap: var(--a);
        align-items: center;
        padding: 4px;
    }
    .pedido .descripcion {
        grid-column: span 5;
        word-break: break-word;
        display: flex;
        flex-direction: column;
        justify-self: flex-start;
        align-items: flex-start;
        text-align: start;
    }
    .pedido .codigo {
        grid-column: span 2;
        word-break: break-word;
        justify-self: flex-start;
    }
    .pedido .precio {
        grid-column: span 2;
        display: flex;
        align-items: baseline;
        gap: var(--a);
    }
    .pedido .submit {
        grid-column: span 2;
        justify-self: flex-end;
    }
    .pedido input {
        width: 100%;
    }
</style>