<script lang="ts">
    import { page } from '$app/state';
    import { enhance } from '$app/forms';
    import { StoreEditarPedido } from '$lib/stores/StoreEditarPedido.svelte';
    import { agruparDatos } from '$lib/utils/filtro';
    import { goto } from '$app/navigation';
    import Pedido from '$lib/components/Vistas/Pedidos/TarjetaPedido.svelte';
    import { StorePedido } from '$lib/stores/StorePedido.svelte';
    import { onMount } from 'svelte';
    import { appState } from '$lib/stores/appState.svelte';

    // Recibe el parámetro de la página actual
    let { id_oportunidad, agente }: { id_oportunidad: string; agente?: any } = $props();

    let { pedidos } = $derived(page.data);
    let agrupacion = $state('id_agrupacion');
    let lista_agrupada = $derived(agruparDatos(pedidos, agrupacion));

    function seleccionarAgrupacion(elementos: any[]) {
        StoreEditarPedido.limpiar();
        
        // Filtramos los elementos válidos aquí mismo
        const elementosValidos = elementos.filter(
            (i) => i.estatus === 'borrador' || i.estatus === 'descartado'
        );
        
        elementosValidos.forEach((item) => {
            StoreEditarPedido.agregar(item);
        });
    }

    function editarPedidoSeleccionado() {
        StorePedido.limpiar();
        StoreEditarPedido.items.forEach((item) => {
            StorePedido.agregar(item);
        });
        appState.setEditarPedido(true);
        StoreEditarPedido.limpiar();
        goto('/inventario');
    }
    
    onMount(() => StoreEditarPedido.limpiar());
</script>

{#if StoreEditarPedido.items.length === 0}
    <button class="butter" onclick={() => goto('/inventario')}>+Pedido nuevo</button>
{:else}
    <button class="butter" onclick={editarPedidoSeleccionado}>Editar</button>
{/if}

<p class="agente">Agente: {agente?.nombre}</p>

<div class="pedidos">
    {#if StoreEditarPedido.items.length === 0}
        {#each lista_agrupada.filter( (grupo) => grupo.elementos.some((i) => i.estatus === 'borrador' || i.estatus === 'descartado') ) as grupo}
            <!-- Corregimos el onclick para que pase la lista completa de elementos. La función se encargará de filtrarlos -->
            <button class="panel grupo" onclick={() => seleccionarAgrupacion(grupo.elementos)}>
                {#each grupo.elementos.filter((i) => i.estatus === 'borrador' || i.estatus === 'descartado') as item}
                    <Pedido {item} />
                {/each}
            </button>
        {/each}
    {:else}
        <div class="panel grupo">
            {#each StoreEditarPedido.items as item}
                <Pedido {item} editando />
            {/each}
        </div>
        <form
            method="POST"
            action="/pedidos?/updatePedido"
            class="form-acciones"
            use:enhance={({ formData }) => {
                if (StoreEditarPedido.items.length > 0) {
                    const pedidosAActualizar = StoreEditarPedido.items.map(
                        ({ agentes, inventario, oportunidades, ...item }) => ({
                            ...item,
                            id_oportunidad: id_oportunidad,
                            estatus: 'seleccionado',
                            id_agente: agente?.id
                        })
                    );

                    formData.append('pedidosAActualizar', JSON.stringify(pedidosAActualizar));
                }
                StoreEditarPedido.limpiar();
            }}
        >
            <button class="butter" type="button" onclick={() => StoreEditarPedido.limpiar()}>
                Cancelar
            </button>
            <button class="butter matcha" type="submit">Relacionar Pedido</button>
        </form>
    {/if}
</div>

<style>
    .pedidos {
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        gap: var(--a);
        padding: var(--a);
        max-height: 60vh;
        height: fit-content;
        overflow: auto;
        width: 100%;
    }
    .grupo {
        display: flex;
        flex-direction: column;
        gap: var(--a);
        padding: var(--a);
    }
    .form-acciones {
        display: flex;
        gap: var(--a);
        padding: var(--a);
        justify-content: flex-end;
    }
    .agente {
        align-self: center;
    }
</style>