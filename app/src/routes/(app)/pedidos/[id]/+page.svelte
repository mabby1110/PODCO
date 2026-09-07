<script lang="ts">
    import { goto } from '$app/navigation';
    import type { PageData } from './$types';

    let { data }: { data: PageData } = $props();

    function navegar(id_agrupacion: string) {
        goto(`/pedidos/${id_agrupacion}`);
    }
</script>

<div>
    {#each data.pedidos as pedido}
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div onclick={() => navegar(pedido.id_agrupacion)}>
            {#each Object.entries(pedido) as [clave, valor]}
                {#if clave === 'catalogo' && valor !== null}
                    <div>
                        <strong>catalogo:</strong>
                        <div style="margin-left: 1rem;">
                            {#each Object.entries(valor as Record<string, any>) as [catClave, catValor]}
                                <div><strong>{catClave}:</strong> {String(catValor)}</div>
                            {/each}
                        </div>
                    </div>
                {:else if typeof valor !== 'object'}
                    <div><strong>{clave}:</strong> {String(valor)}</div>
                {/if}
            {/each}
            <hr />
        </div>
    {/each}
</div>