<script lang="ts">
    import { page } from '$app/state';
    import { selectedGroupStore } from '$lib/stores/groupFilter.svelte';

    const agentes = $derived(page.data.agentes ?? []);
    const profile = $derived(page.data.profile);

    // Sincronización inicial y reactiva con el nuevo store
    // Si es admin/oper usa el valor del store (cookie), si no, fuerza su propio ID
    let selected = $state(
        (profile.isAdmin || profile.isOper) 
            ? selectedGroupStore.selectedAgent 
            : String(profile.id)
    );

    // Actualiza el store cuando cambia la selección
    $effect(() => {
        selectedGroupStore.selectedAgent = selected;
    });
</script>

{#if profile.isAdmin || profile.isOper}
    <div class="filter-container">
        <select bind:value={selected} class="butter">
            <option value="">Todos los agentes</option>
            {#each agentes as agente}
                <option value={String(agente.id)}>{agente.nombre}</option>
            {/each}
        </select>
    </div>
{/if}

<style>
    .filter-container {
        display: flex;
        flex-wrap: wrap;
        gap: var(--a);
        justify-content: end;
    }
</style>