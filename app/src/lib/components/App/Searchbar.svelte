<script lang="ts">
    type Props = {
        label?: string;
        data: Record<string, any>[];
        keyColumns: string[];
        selectedItem?: Record<string, any> | null;
        lenght?: number;
        unique?: boolean;
    };

    let {
        label,
        data,
        keyColumns,
        selectedItem = $bindable(null),
        lenght = $bindable(0),
        unique = $bindable(false)
    }: Props = $props();

    let term = $state('');
    let visibleColumns = $state([...keyColumns]);

    let results = $derived(
        term.trim() === ''
            ? []
            : data.filter((obj) =>
                  keyColumns.some((key) =>
                      String(obj[key] ?? '')
                          .toLowerCase()
                          .includes(term.toLowerCase())
                  )
              )
    );

    $effect(() => {
        lenght = results.length;
        unique = term.length > 0 && lenght === 0;
    });

    function hideColumn(col: string) {
        visibleColumns = visibleColumns.filter((c) => c !== col);
    }

    function resetColumns() {
        visibleColumns = [...keyColumns];
    }
</script>

<div class="block">
    <div class="header">
        {#if label}
            <h3>{label}</h3>
        {/if}
        {#if visibleColumns.length < keyColumns.length}
            <button class="reset-button" onclick={resetColumns}>Resetear Columnas</button>
        {/if}
    </div>
    
    <input type="search" bind:value={term} />
    
    {#if results.length > 0 && visibleColumns.length > 0}
        <div class="results" style="--col-count: {visibleColumns.length};">
            {#each visibleColumns as col}
                <button class="grid-header" onclick={() => hideColumn(col)}>
                    {col}
                </button>
            {/each}

            {#each results as item}
                <button
                    class="list-button"
                    onclick={() => { selectedItem = item; }}
                >
                    {#each visibleColumns as key}
                        <div class="grid-cell">{item[key] ?? ''}</div>
                    {/each}
                </button>
            {/each}
        </div>
    {/if}
</div>

<style>
    .block {
        display: flex;
        flex-direction: column;
        gap: 8px;
        width: 100%;
    }

    .header {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        flex-grow: 1;
    }

    .reset-button {
        padding: 4px 8px;
        cursor: pointer;
    }

    .results {
        display: grid;
        grid-template-columns: repeat(var(--col-count), 1fr);
        width: 100%;
        max-height: 400px;
        overflow-y: auto;
    }

    .grid-header {
        all: unset;
        box-sizing: border-box;
        font-weight: bold;
        text-align: left;
        padding: 8px 4px;
        border-bottom: 2px solid;
        position: sticky;
        top: 0;
        background-color: Canvas;
        z-index: 1;
        cursor: pointer;
    }

    .list-button {
        display: contents;
    }

    .grid-cell {
        padding: 8px 4px;
        text-align: left;
        border-bottom: 1px solid rgba(128, 128, 128, 0.2);
    }

    .list-button:hover .grid-cell {
        background-color: var(--color-contrast);
        cursor: pointer;
    }
</style>