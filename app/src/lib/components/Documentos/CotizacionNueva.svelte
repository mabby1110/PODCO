<script lang="ts">
    type Cotizacion = {
        file: File;
        total: number | null;
    };

    let {
        label = 'Cotizaciones',
        required = false,
        disabled = false,
        hint = '',
        cotizaciones = $bindable<Cotizacion[]>([])
    }: {
        label?: string;
        required?: boolean;
        disabled?: boolean;
        hint?: string;
        cotizaciones?: Cotizacion[];
    } = $props();

    let inputEl: HTMLInputElement;
    let isDragging = $state(false);

    function handleChange(e: Event) {
        const input = e.target as HTMLInputElement;

        if (!input.files) return;

        const selected = Array.from(input.files);

        cotizaciones = [
            ...cotizaciones,
            ...selected.map(file => ({
                file,
                total: null
            }))
        ];

        input.value = '';
    }

    function removeCotizacion(index: number) {
        cotizaciones.splice(index, 1);
        cotizaciones = [...cotizaciones];
    }
</script>

<div class="upload-container">
    {#if label}
        <h3>{label}</h3>
    {/if}

    {#if hint}
        <p class="hint">{hint}</p>
    {/if}

    <input
        bind:this={inputEl}
        type="file"
        class="file-input"
        class:dragging={isDragging}
        multiple
        {disabled}
        onchange={handleChange}
        ondragover={() => {
            if (!disabled) isDragging = true;
        }}
        ondragleave={() => {
            isDragging = false;
        }}
        ondrop={() => {
            isDragging = false;
        }}
        required={required && cotizaciones.length === 0}
    />

    {#if cotizaciones.length > 0}
        <div class="files">
            {#each cotizaciones as cotizacion, i}
                <div class="cotizacion-item">
                    <button
                        type="button"
                        class="close-btn"
                        onclick={() => removeCotizacion(i)}
                    >
                        ×
                    </button>

                    <div class="info">
                        <p class="filename">
                            {cotizacion.file.name}
                        </p>

                        <input
                            type="number"
                            bind:value={cotizacion.total}
                            placeholder="Total cotizado"
                            min="0"
                            step="0.01"
                            required
                        />
                    </div>
                </div>
            {/each}
        </div>
    {/if}
</div>

<style>
    .upload-container {
        display: flex;
        flex-direction: column;
        gap: var(--a);
        width: 100%;
    }

    .file-input {
        width: 100%;
        padding: var(--c);
        border: 1px dashed #d4d4d8;
        border-radius: 6px;
        background-color: #fafafa;
        cursor: pointer;
        transition: border-color 0.2s ease,
                    background-color 0.2s ease;
        outline: none;
    }

    .file-input:hover:not(:disabled) {
        border-color: var(--color-secondary);
        background-color: #f4f4f5;
    }

    .file-input.dragging {
        background-color: var(--color-highlight);
        border-color: var(--color-highlight);
    }

    .file-input:focus-visible {
        border-color: #18181b;
        border-style: solid;
    }

    .file-input::file-selector-button {
        display: none;
    }

    .files {
        display: flex;
        flex-direction: column;
        gap: var(--a);
    }

    .cotizacion-item {
        display: flex;
        gap: var(--a);
        align-items: flex-start;
        padding: var(--a);
        border: 1px solid #e4e4e7;
        border-radius: 6px;
    }

    .info {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: var(--a);
    }

    .filename {
        margin: 0;
        word-break: break-word;
    }

    .info input {
        max-width: 250px;
    }

    .close-btn {
        border: none;
        cursor: pointer;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
    }

    .close-btn:hover {
        background-color: var(--color-error);
    }
</style>