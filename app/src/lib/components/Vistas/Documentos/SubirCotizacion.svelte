<script lang="ts">
    import { invalidateAll } from '$app/navigation';

    type Item = {
        file: File;
    };

    let {
        name = 'docs_cotizaciones',
        amountLabel = 'Total cotizado',
        amountName = 'totales',
        id_nodo,
        id_cliente,
        id_agente,
        pedidos = [],
        required = false
    }: {
        name?: string;
        amountLabel?: string;
        amountName?: string;
        id_nodo?: string;
        id_cliente?: string;
        id_agente?: string;
        pedidos?: any[];
        required?: boolean;
    } = $props();

    let items = $state<Item[]>([]);
    let inputEl: HTMLInputElement;
    let isDragging = $state(false);
    let isSubmitting = $state(false);

    let totalPedidos = $derived(
        pedidos.reduce((acc: number, item: any) => {
            return item.estatus === 'aprobado' ? acc + (item.precio_unitario * item.cantidad) : acc;
        }, 0)
    );

    function handleChange(e: Event) {
        const input = e.target as HTMLInputElement;
        if (!input.files) return;

        items = Array.from(input.files).map(file => ({ file })).slice(0, 1);
        input.value = '';
    }

    function removeItem(index: number) {
        items.splice(index, 1);
        items = [...items];
    }

    async function handleSubmit(event: SubmitEvent) {
        event.preventDefault();
        if (isSubmitting || items.length === 0) return;

        isSubmitting = true;

        try {
            const formData = new FormData();
            
            if (id_nodo) formData.append('id_nodo', id_nodo); 
            if (id_cliente) formData.append('id_cliente', id_cliente);
            if (id_agente) formData.append('id_agente', id_agente);

            items.forEach((item) => {
                formData.append(name, item.file);
                formData.append(amountName, String(totalPedidos));
            });

            const response = await fetch('/documentos?/addCotizacion', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                console.error('Error HTTP:', response.status);
                return;
            }

            const result = await response.json();
            
            if (result.type === 'success' || result.status === 200) {
                const data = typeof result.data === 'string' ? JSON.parse(result.data) : result.data;
                const ids = data?.[1]?.ids || data?.ids;

                // accion secuencial para cuando el post a documentos?/addCotizacion sea exitoso y devuelva el id
                
            } else {
                console.error('Error de Action:', result);
            }

            items = [];
            if (inputEl) inputEl.value = '';
            
            await invalidateAll();
        } catch (error) {
            console.error('Excepción en fetch:', error);
        } finally {
            isSubmitting = false;
        }
    }
</script>

<form method="POST" enctype="multipart/form-data" onsubmit={handleSubmit}>
    <div class="upload-container">
        {#if items.length > 0}
            <div class="files">
                {#each items as item, i}
                    <div class="item panel">
                        <button type="button" class="butter milk" onclick={() => removeItem(i)}> ✕ </button>

                        <div class="info">
                            <b class="filename">{item.file.name}</b>
                            <label for="monto">{amountLabel}</label>
                            <input
                                id="monto"
                                type="number"
                                bind:value={totalPedidos}
                                min="0"
                                step="0.01"
                                required
                            />
                        </div>

                        <button type="submit" class="butter matcha guardar" disabled={isSubmitting}>
                            {isSubmitting ? 'Guardando...' : 'Guardar'}
                        </button>
                    </div>
                {/each}
            </div>
        {:else}
            <input
                bind:this={inputEl}
                type="file"
                class="file-input"
                class:dragging={isDragging}
                {required}
                onchange={handleChange}
                ondragover={(e) => { e.preventDefault(); isDragging = true; }}
                ondragleave={() => isDragging = false}
                ondrop={(e) => { e.preventDefault(); isDragging = false; }}
            />
        {/if}
    </div>
</form>

<style>
    form {
        width: 100%;
    }
    .upload-container {
        display: flex;
        flex-direction: column;
        gap: var(--a);
    }
    .file-input {
        padding: var(--c);
        border: 1px dashed #d4d4d8;
        border-radius: 6px;
        background-color: var(--color-background);
        cursor: pointer;
        transition: border-color 0.2s ease, background-color 0.2s ease;
        outline: none;
    }
    .file-input:hover {
        border-color: var(--color-secondary);
    }
    .file-input.dragging {
        background-color: var(--color-highlight);
        border-color: var(--color-highlight);
    }
    .file-input::file-selector-button {
        display: none;
    }
    .item {
        width: fit-content;
        display: flex;
		flex-wrap: wrap;
        gap: var(--a);
        align-items: flex-start;
		justify-content: flex-end;
        padding: var(--a);
        background-color: var(--color-background);
    }
    .item .guardar {
        align-self: flex-end;
    }
    .info {
        flex: 1;
        display: flex;
		flex-wrap: wrap;
		align-items: center;
        gap: var(--a);
    }
    .filename {
        margin: 0;
        word-break: break-word;
    }
    .info input[type='number'] {
        max-width: 250px;
    }
</style>