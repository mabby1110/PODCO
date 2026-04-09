<script lang="ts">
    let {
        label = null,
        name = 'file',
        required = false,
        disabled = false,
        hint = '',
        multiple = true
    }: {
        label: string | null;
        name: string;
        required?: boolean;
        disabled?: boolean;
        hint?: string;
        multiple?: boolean;
    } = $props();

    let files = $state<File[]>([]);
    let inputEl: HTMLInputElement;
    let isDragging = $state(false);

    function handleChange(e: Event) {
        const input = e.target as HTMLInputElement;
        if (!input.files) return;

        const selected = Array.from(input.files);

        if (multiple) {
            files = [...files, ...selected];
        } else {
            files = [selected[0]];
        }

        updateInputFiles();
    }

    function removeFile(index: number) {
        files.splice(index, 1);
        files = [...files];
        updateInputFiles();
    }

    function updateInputFiles() {
        const dt = new DataTransfer();
        files.forEach((f) => dt.items.add(f));
        inputEl.files = dt.files;
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
        id={name}
        type="file"
        {name}
        class="file-input"
        class:dragging={isDragging}
        {multiple}
        onchange={handleChange}
        ondragover={() => { if (!disabled) isDragging = true; }}
        ondragleave={() => isDragging = false}
        ondrop={() => isDragging = false}
        {required}
        {disabled}
    />
    {#if files.length > 0}
        <div class="files">
            {#each files as file, i}
                <div class="file">
                    <button class="close-btn" type="button" onclick={() => removeFile(i)}>x</button>
                    <p>{file.name}</p>
                </div>
            {/each}
        </div>
    {/if}
</div>

<style>
    .upload-container {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: var(--a);
    }

    .file-input {
        width: 100%;
        padding: var(--c);
        border: 1px dashed #d4d4d8;
        border-radius: 6px;
        background-color: #fafafa;
        cursor: pointer;
        transition: border-color 0.2s ease, background-color 0.2s ease;
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

    .file {
        display: flex;
        align-items: center;
        gap: var(--a);
    }

    .close-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        border: none;
        cursor: pointer;
        padding: 0.2rem 0.4rem;
        border-radius: 4px;
        transition: color 0.2s ease, background-color 0.2s ease;
    }

    .close-btn:hover {
        background-color: var(--color-error);
    }
</style>