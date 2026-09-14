<script lang="ts">
    import ItemPedido from './ItemPedido.svelte';
    import { StorePedidoEditar } from '$lib/stores/pedidos/StorePedidoEditar.svelte';
    import { goto } from '$app/navigation';

    let { pedidos, disable = false } = $props();

    function editarPedidoCompleto() {
        goto('/pedidos');
        StorePedidoEditar.pushLista(pedidos);
        StorePedidoEditar.toggleModal(true);
    }
</script>

<div class="lista-pedidos" style="display: flex; flex-direction: column; gap: 0.5rem;">
    {#each pedidos as pedido (pedido.id)}
        <ItemPedido {pedido} {disable} />
    {/each}

    {#if !disable}
        <div class="acciones" style="margin-top: 1rem;">
            <button class="butter" onclick={editarPedidoCompleto}>Seleccionar todos</button>
        </div>
    {/if}
</div>