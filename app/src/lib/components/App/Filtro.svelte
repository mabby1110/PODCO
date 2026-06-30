<script lang="ts">
    import { page } from '$app/state';
    import { filtroStore, type ColumnDef } from '$lib/stores/filtroStore.svelte';

    let {
        categorias,
        calendar = false,
        cookies
    } = $props<{
        categorias: ColumnDef[];
        calendar?: boolean;
        cookies?: string;
    }>();

    let selectedColumnKey = $state<string>(categorias?.key || '');
    let selectedAction = $state('');
    let inputValue = $state<string>('');

    let currentRoute = $derived(cookies || page.url.pathname);
    let activeFilters = $derived(filtroStore.filtersByRoute[currentRoute] || []);

    const actionsWithInput = ['contains', 'gte', 'gt', 'lte', 'lt', 'dateGte', 'dateLte'];
    const dateActions = ['dateGte', 'dateLte'];

    function handleAdd() {
        const column = categorias.find((c: any) => c.key === selectedColumnKey);
        if (!column) return;
        
        if (actionsWithInput.includes(selectedAction) && !String(inputValue).trim()) return;

        // Se mantiene el string en crudo del input tipo date (YYYY-MM-DD) o texto sin pasar a minúsculas
        const valueToAdd = actionsWithInput.includes(selectedAction) 
            ? String(inputValue).trim() 
            : '';
            
        filtroStore.addFilter(currentRoute, column, selectedAction, valueToAdd);
        inputValue = '';
    }
</script>

<div class="contenedor-filtro">
    <div class="panel">
        {#if !calendar}
            <div class="filter-actions">
                <select bind:value={selectedColumnKey}>
                    <option value="" disabled>Campo</option>
                    {#each categorias as col}
                        <option value={col.key}>{col.label}</option>
                    {/each}
                </select>

                <select bind:value={selectedAction}>
                    <option value="" disabled>Condición</option>
                    <option value="contains">Contiene</option>
                    <option value="dateGte">Fecha Desde (&gt;=)</option>
                    <option value="dateLte">Fecha Hasta (&lt;=)</option>
                    <option value="gte">Mayor o igual (&gt;=)</option>
                    <option value="gt">Mayor que (&gt;)</option>
                    <option value="lte">Menor o igual (&lt;=)</option>
                    <option value="lt">Menor que (&lt;)</option>
                    <option value="asc">Ascendente</option>
                    <option value="desc">Desendente</option>
                    <option value="isNull">Es nulo</option>
                    <option value="hasData">Contiene datos</option>
                </select>

                {#if actionsWithInput.includes(selectedAction)}
                    <input
                        type={dateActions.includes(selectedAction) ? 'date' : (selectedAction === 'contains' ? 'text' : 'number')}
                        bind:value={inputValue}
                        placeholder={selectedAction === 'contains' ? 'Escribe la palabra clave...' : 'Valor...'}
                        onkeydown={(e) => e.key === 'Enter' && handleAdd()}
                    />
                {/if}

                <button class="butter" type="button" onclick={handleAdd}>Agregar</button>
            </div>

            {#if activeFilters.length > 0}
                <div class="filter-list">
                    {#if activeFilters.length > 1}
                        <button class="chop chip butter" onclick={() => filtroStore.clearFilters(currentRoute)}>
                            Limpiar todo
                        </button>
                    {/if}
                    {#each activeFilters as filter (filter.id)}
                        <button
                            class="chip butter"
                            onclick={() => filtroStore.removeFilter(currentRoute, filter.id)}
                        >
                            {filter.column.label}
                            {#if filter.action === 'contains'}
                                contiene "{filter.value}"
                            {:else if filter.action === 'dateGte'}
                                desde {filter.value}
                            {:else if filter.action === 'dateLte'}
                                hasta {filter.value}
                            {:else if filter.action === 'gte'}
                                &gt;= {filter.value}
                            {:else if filter.action === 'gt'}
                                &gt; {filter.value}
                            {:else if filter.action === 'lte'}
                                &lt;= {filter.value}
                            {:else if filter.action === 'lt'}
                                &lt; {filter.value}
                            {:else if filter.action === 'asc'}
                                (Ascendente)
                            {:else if filter.action === 'desc'}
                                (Desendente)
                            {:else if filter.action === 'isNull'}
                                (nulo)
                            {:else if filter.action === 'hasData'}
                                (Contiene datos)
                            {/if}
                            <span class="close-chip">×</span>
                        </button>
                    {/each}
                </div>
            {/if}
        {/if}
    </div>
</div>
<style>
	.contenedor-filtro {
		width: 100%;
	}
	.panel {
		gap: var(--a);
		width: fit-content;
		background-color: var(--color-contrast);
	}
	.chop {
		background-color: var(--color-error);
		padding: 4px var(--a);
		border-radius: 16px;
		display: flex;
		align-items: center;
		gap: 0.4rem;
	}
	.close-chip {
		font-weight: bold;
		padding: 0 4px;
	}
	.chip:hover {
		background-color: var(--color-error);
	}
	.filter-actions {
		display: flex;
		flex-wrap: wrap;
		gap: var(--a);
	}
	.filter-list {
		display: flex;
		flex-wrap: wrap;
		gap: var(--a);
		max-height: 30vh;
		overflow: auto;
		margin-top: var(--a);
	}
</style>
