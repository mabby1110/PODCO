<script lang="ts">
    import { productosSeleccionadosStore } from '$lib/stores/productosSeleccionadosStore.svelte';
	import ContadorProducto from '../Pedidos/ContadorProducto.svelte';

    let { producto } = $props();
    
    let esSeleccionado = $derived(
        productosSeleccionadosStore.items.some((p: any) => p.producto.id === producto?.id)
    );

    function handleClick() {
        productosSeleccionadosStore.agregar(producto);
    }
</script>

<div style={producto?.style} 
    class="producto" 
    class:seleccionado={esSeleccionado}
    role="button"
    tabindex="0"
    onclick={handleClick}
    onkeydown={handleClick}>
    <div class="producto-header">
        <b class="tiny">{producto?.serie || producto?.codigo}</b>
        <p>{producto?.descripcion}</p>
    </div>

    <div class="producto-meta">
        <p>{producto?.ubicacion_fisica}</p>
        <p>{producto?.categorias}</p>
    </div>
    <p class="header-meta">
        {#if esSeleccionado}
            <ContadorProducto {producto}/>
        {:else}
            cantidad: {producto?.cantidad}
        {/if}
    </p>
</div>

<style>
    .producto {
        position: relative;
        padding: 4px var(--a);

        background-color: var(--color-secondary);
        border-radius: var(--a);
        white-space: pre-wrap;
        cursor: pointer;

        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        transition: background-color 0.2s ease;
    }

    .producto:hover,
    .producto.seleccionado {
        background-color: var(--color-highlight);
    }

    .producto-header {
        width: 100%;

        display: flex;
        flex-wrap: wrap;
        align-items: baseline;
        gap: 0 var(--a);
    }
    .producto-meta {
        display: flex;
        flex-wrap: wrap;
        gap: var(--a);
        font-size: smaller;
        align-items: end;
    }
    .header-meta {
        position: absolute;
        right: var(--a);
    }
</style>