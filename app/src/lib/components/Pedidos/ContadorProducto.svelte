<script lang="ts">
    import { productosSeleccionadosStore } from '$lib/stores/productosSeleccionadosStore.svelte';

    let { producto } = $props();
    let cantidad = $derived(productosSeleccionadosStore.obtenerCantidad(producto.id));
    
    function agregar(e: Event) {
        e.stopPropagation();
        productosSeleccionadosStore.agregar(producto);
    }
    
    function quitar(e: Event) {
        e.stopPropagation();
        productosSeleccionadosStore.quitar(producto);
    }
</script>

<div class="control-contador">
    <button type="button" class="butter" onclick={quitar} disabled={cantidad === 0}> - </button>

    <span class="cantidad-viva">{cantidad}/{producto.cantidad}</span>

    <button type="button" class="butter" onclick={agregar}> + </button>
</div>

<style>
    .control-contador {
        display: inline-flex;
        align-items: center;
    }
    .butter {
        width: var(--d);
    }
    .cantidad-viva {
        min-width: 1.5rem;
        text-align: center;
        font-weight: bold;
    }
</style>