<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { profile } from '$lib/stores/profileStore.svelte';

	type Item = {
		file: File;
		titulo: string;
	};

	let {
		tipo = 'files',
		oportunidad,
		action = '/documentos?/subirAdjunto',
		required = false,
		disabled = false,
		submitLabel = 'Guardar'
	}: {
		tipo: string;
		oportunidad: { id: string; cliente: string };
		action?: string;
		required?: boolean;
		disabled?: boolean;
		submitLabel?: string;
	} = $props();

	let items = $state<Item[]>([]);
	let inputEl: HTMLInputElement;
	let formEl: HTMLFormElement;
	let isDragging = $state(false);
	let isSubmitting = $state(false);
	let prefijoTipoDocumento: Record<string, string> = {
		docs_cotizaciones: 'Q',
		docs_adjuntos: 'A'
	};

	function handleChange(e: Event) {
		const input = e.target as HTMLInputElement;

		if (!input.files) return;

		const selected = Array.from(input.files);
		const newItems = selected.map((file) => ({
			file,
			titulo: file.name.split('.')[0]
		}));

		items = [...items, ...newItems];

		input.value = '';
	}

	function removeItem(index: number) {
		items.splice(index, 1);
		items = [...items];
	}

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();

		if (isSubmitting) return;

		isSubmitting = true;

		try {
			const formData = new FormData(formEl);

			items.forEach((item) => {
				const file = new File([item.file], item.titulo, {
					type: item.file.type
				});

				formData.append(tipo, file);
			});

			const response = await fetch(action, {
				method: 'POST',
				body: formData
			});

			if (!response.ok) {
				const result = await response.text();
				console.error(result);
				return;
			}

			items = [];

			if (inputEl) {
				inputEl.value = '';
			}

			await invalidateAll();
		} catch (error) {
			console.error(error);
		} finally {
			isSubmitting = false;
		}
	}
</script>

<form
	bind:this={formEl}
	method="POST"
	enctype="multipart/form-data"
	{action}
	onsubmit={handleSubmit}
>
	<input type="hidden" name="tipo" value={tipo} />
	<input type="hidden" name="id_oportunidad" value={oportunidad.id} />
	<input type="hidden" name="nombre_agente" value={$profile?.nombre} />
	<input type="hidden" name="nombre_cliente" value={oportunidad.cliente} />

	<div class="upload-container">
		<input
			bind:this={inputEl}
			type="file"
			class="file-input"
			class:dragging={isDragging}
			multiple
			{disabled}
			required={required && items.length === 0}
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
		/>

		{#if items.length > 0}
			<div class="files">
				{#each items as item, i}
					<div class="item">
						<button type="button" class="close-btn" onclick={() => removeItem(i)}> × </button>

						<div class="info">
							<input type="text" bind:value={item.titulo} />
						</div>
					</div>
				{/each}

				<button type="submit" class="btn-save-small butter" disabled={isSubmitting}>
					{#if isSubmitting}
						Guardando...
					{:else}
						{submitLabel}
					{/if}
				</button>
			</div>
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
		width: 100%;
	}

	.file-input {
		width: 100%;
		max-width: 800px;
		padding: var(--c);
		border: 1px dashed #d4d4d8;
		border-radius: 6px;
		background-color: #fafafa;
		cursor: pointer;
		transition:
			border-color 0.2s ease,
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

	.item {
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
