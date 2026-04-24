<script lang="ts">
    import { enhance } from '$app/forms';

    let {
        jsonList = $bindable(),
        id,
        action = '?/updateList',
        name,
        label = 'Etiqueta'
    }: {
        jsonList: string;
        id: string;
        action?: string;
        name?: string;
        label?: string;
    } = $props();

    let lista = $state<string[]>(
        jsonList && jsonList !== '' ? JSON.parse(jsonList) : []
    );
    let editIndex = $state<number | null>(null);
    let isAdding = $state(false);
    let currentString = $state<string>('');

    let list_stringified = $derived(JSON.stringify(lista));
    let formEl = $state<HTMLFormElement | null>(null);

    function openNewItem() {
        isAdding = true;
        editIndex = null;
        currentString = '';
    }

    function editItem(i: number) {
        editIndex = i;
        isAdding = false;
        currentString = lista[i];
    }

    function cancel() {
        editIndex = null;
        isAdding = false;
    }

    function saveItem() {
        const val = currentString.trim();
        if (!val) return;

        if (editIndex !== null) {
            lista[editIndex] = val;
        } else if (isAdding) {
            lista = [...lista, val];
        }
        jsonList = list_stringified;
        cancel();
        queueMicrotask(() => formEl?.requestSubmit());
    }

    function removeItem(i: number) {
        if (!confirm('¿Eliminar elemento?')) return;
        lista = lista.filter((_, idx) => idx !== i);
        jsonList = list_stringified;
        cancel();
        queueMicrotask(() => formEl?.requestSubmit());
    }

    function handleSubmit() {
        return async ({ update }: any) => {
            await update();
        };
    }
</script>

<form bind:this={formEl} method="POST" {action} use:enhance={handleSubmit}>
    <input type="hidden" name="id" value={id} />
    <input type="hidden" {name} value={list_stringified} />

    <div class="entradas">
        {#each lista as item, i}
            <div class="entrada">
                {#if editIndex === i}
                    <label class="field-input">
                        <span>{label}</span>
                        <input type="text" bind:value={currentString} />
                    </label>
                    <div class="form-actions">
                        <button type="button" class="butter" onclick={saveItem}>Guardar</button>
                        <button type="button" class="close-btn" onclick={cancel}>X</button>
                    </div>
                {:else}
                    <div class="item-display">
                        <span>{item}</span>
                        <div class="form-actions">
                            <button type="button" class="btn-icon" onclick={() => editItem(i)}>✏️</button>
                            <button type="button" class="btn-icon" onclick={() => removeItem(i)}>🗑️</button>
                        </div>
                    </div>
                {/if}
            </div>
        {/each}

        {#if isAdding}
            <div class="entrada">
                <label class="field-input">
                    <span>{label}</span>
                    <input type="text" bind:value={currentString} />
                </label>
                <div class="form-actions">
                    <button type="button" class="butter" onclick={saveItem}>Guardar</button>
                    <button type="button" class="butter" onclick={cancel}>Cancelar</button>
                </div>
            </div>
        {/if}

        {#if editIndex === null && !isAdding}
            <button type="button" class="butter" onclick={openNewItem}>+ Agregar {label.toLowerCase()}</button>
        {/if}
    </div>
</form>

<style>
    .entradas {
        padding: 8px;
        border: 1px solid var(--color-contrast, #ccc);
        border-radius: 8px;
        display: flex;
        flex-direction: column;
        gap: 8px;
    }
    .entrada {
        padding: 4px;
        border-bottom: 1px dashed var(--color-contrast, #eee);
    }
    .entrada:last-child {
        border-bottom: none;
    }
    .item-display {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    .field-input {
        display: flex;
        flex-grow: 1;
        gap: 8px;
        align-items: center;
    }
    .form-actions {
        display: flex;
        align-self: flex-end;
        justify-content: flex-end;
        gap: 8px;
        margin-top: 4px;
    }
    .btn-icon {
        background: none;
        border: none;
        cursor: pointer;
        font-size: 16px;
        padding: 4px;
        opacity: 0.7;
    }
    .btn-icon:hover {
        opacity: 1;
    }
</style>