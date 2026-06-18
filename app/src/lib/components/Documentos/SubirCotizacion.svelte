<script lang="ts">
	import { invalidateAll } from '$app/navigation';

	type Item = {
		file: File;
		amount: number | null;
	};

	let {
		name = 'files',
		amountLabel = 'Monto',
		amountName = 'amounts',
		id_nodo_p,
		cliente,
		agente,
		action = '',
		required = false,
		disabled = false,
		multiple = true,
		submitLabel = 'Guardar'
	}: {
		name?: string;
		amountLabel?: string;
		amountName?: string;
		id_nodo_p?: string;
		cliente?: any;
		agente?: any;
		action?: string;
		required?: boolean;
		disabled?: boolean;
		multiple?: boolean;
		submitLabel?: string;
	} = $props();

	let items = $state<Item[]>([]);
	let inputEl: HTMLInputElement;
	let formEl: HTMLFormElement;
	let isDragging = $state(false);
	let isSubmitting = $state(false);

	function handleChange(e: Event) {
		const input = e.target as HTMLInputElement;

		if (!input.files) return;

		const selected = Array.from(input.files);

		const newItems = selected.map((file) => ({
			file,
			amount: null
		}));

		if (multiple) {
			items = [...items, ...newItems];
		} else {
			items = newItems.slice(0, 1);
		}

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
				formData.append(name, item.file);
				formData.append(amountName, String(item.amount ?? 0));
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
	<input type="hidden" name="entity" value={name} />

	{#if id_nodo_p}
		<input type="hidden" name="id_nodo_p" value={id_nodo_p} />
	{/if}

	{#if cliente}
		<input type="hidden" name="id_cliente" value={cliente.id} />
	{/if}

	{#if agente}
		<input type="hidden" name="id_agente" value={agente.id} />
		<input type="hidden" name="agente" value={agente.nombre} />
	{/if}

	<div class="upload-container">
		<input
			bind:this={inputEl}
			type="file"
			class="file-input"
			class:dragging={isDragging}
			{multiple}
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
							<p class="filename">
								{item.file.name}
							</p>

							<label>
								{amountLabel}
							</label>

							<input
								type="number"
								bind:value={item.amount}
								placeholder={amountLabel}
								min="0"
								step="0.01"
								required
							/>
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

	.info input[type='number'] {
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
