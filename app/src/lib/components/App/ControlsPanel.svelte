<script lang="ts">
    import { appState } from '$lib/stores/appState.svelte';
    import { profile } from '$lib/stores/profileStore.svelte';
    import { goto } from '$app/navigation';

    const navigate = (path: string) => {
        appState.togglePageActions();
        goto(path);
    };
</script>

<div class="controls-container">
    <div class="button-group">
        <button onclick={() => navigate('/clientes')} class="butter">
            👨‍💼 Clientes
        </button>
        <button onclick={() => navigate('/oportunidades')} class="butter">
            📋 Oportunidades
        </button>
        <button onclick={() => navigate('/actividades')} class="butter">
            ⚡ Actividades
        </button>
        <button onclick={() => navigate('/calendario')} class="butter">
            📆 Calendario
        </button>
        <button onclick={() => navigate('/documentos')} class="butter">
            📄 Documentos
        </button>
        <button onclick={() => navigate('/inventario')} class="butter">
            📦 Inventario
        </button>
        <!-- <button onclick={() => navigate('/pedidos')} class="butter">
            🛒 Pedidos
        </button> -->
        {#if $profile?.isAdmin}
            <button onclick={() => navigate('/estadisticas')} class="butter">
                📊 Estadisticas
            </button>
        {/if}
    </div>
</div>

<style>
    .controls-container {
        background: var(--color-primary);
        backdrop-filter: blur(4px);
        border: 1px solid var(--color-muted);
        border-radius: 0 var(--a) var(--a) 0;
        padding: var(--a);
        display: flex;
        flex-direction: column;
        gap: var(--a);
    }

    .button-group {
        display: flex;
        flex-direction: column;
        gap: var(--a);
        justify-content: flex-end;
    }
    
    button {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: var(--color-secondary);
        border: none;
        color: inherit;
        font: inherit;
        cursor: pointer;
        width: 100%;
        text-align: left;
    }
</style>