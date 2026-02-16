<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidate } from '$app/navigation';

	let {
		label,
		name,
		value = $bindable(),
		type = 'text',
		rows = 3,
		id,
		action = '?/updateClient',
		placeholder = '',
		hint = '',
		options = []
	}: {
		label: string;
		name: string;
		value: string;
		type?: 'text' | 'textarea' | 'file' | 'email' | 'number' | 'date' | 'select';
		rows?: number;
		id: string;
		action?: string;
		placeholder?: string;
		hint?: string;
		options?: Array<{ id: string | number; nombre: string }>;
	} = $props();

	let isEditing = $state(false);
	let editedValue = $state(value);
	let originalValue = value;

	function toggleEdit(e: Event) {
		e.stopPropagation();
		isEditing = !isEditing;
		if (!isEditing) {
			// Cancelar: restaurar valor original
			editedValue = originalValue;
		}
	}

	function handleSubmit() {
		return async ({ result }: any) => {
			if (result.type === 'success') {
				isEditing = false;
				originalValue = editedValue;
				value = editedValue;
				await invalidate('app:data');
			}
		};
	}

	// Obtener el nombre del agente seleccionado
	$effect(() => {
		if (type === 'select' && !isEditing && options.length > 0) {
			const selectedOption = options.find((opt) => opt.id == value);
			if (selectedOption) {
				editedValue = selectedOption.nombre;
			}
		}
	});
</script>

<form method="POST" {action} use:enhance={handleSubmit}>
	<input type="hidden" name="id" value={id} />
	<input type="hidden" name="field" value={name} />

	<div class="detail-block">
		<div class="detail-header">
			<span class="label">{label}:</span>
			{#if !isEditing}
				<button type="button" class="btn-edit-small" onclick={toggleEdit}> ✏️ </button>
			{/if}
		</div>

		{#if hint && !isEditing}
			<p class="hint">{hint}</p>
		{/if}

		{#if isEditing}
			{#if type === 'textarea'}
				<textarea {name} bind:value={editedValue} {rows} {placeholder}></textarea>
			{:else if type === 'file'}
				<input type="file" {name} class="file-input" />
			{:else if type === 'select'}
				<select {name} bind:value>
					<option {value}>
						{value}
					</option>
					{#each options as option}
						<option value={option.id}>
							{option.nombre}
						</option>
					{/each}
				</select>
			{:else}
				<input {type} {name} bind:value={editedValue} {placeholder} />
			{/if}

			<div class="button-group-inline">
				<button type="submit" class="btn-save-small">Guardar</button>
				<button type="button" class="btn-cancel-small" onclick={toggleEdit}> Cancelar </button>
			</div>
		{:else}
			<p class="value">{editedValue || 'Sin información'}</p>
		{/if}
	</div>
</form>

<style>
	form {
		width: 100%;
	}
	.detail-block {
		display: flex;
		flex-direction: column;
		gap: var(--a, 8px);
	}
	.detail-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.label {
		font-size: 20px;
	}
	.hint {
		font-size: 14px;
		opacity: 0.7;
		margin: 0;
	}
	.value {
		margin: 0;
		white-space: pre-wrap;
		word-break: break-word;
	}
	textarea,
	input[type='text'],
	input[type='email'],
	input[type='number'],
	input[type='date'],
	select {
		width: 100%;
		padding: 8px;
		border-radius: 4px;
		border: 1px solid rgba(255, 255, 255, 0.3);
		background: rgba(255, 255, 255, 0.1);
		color: inherit;
		font-family: inherit;
		font-size: 14px;
	}

	select {
		cursor: pointer;
		transition: all 0.2s;
	}

	select:hover {
		background: rgba(255, 255, 255, 0.15);
		border-color: rgba(255, 255, 255, 0.5);
	}

	select:focus {
		outline: none;
		border-color: var(--color-secondary, #fff);
		background: rgba(255, 255, 255, 0.2);
	}

	textarea {
		resize: vertical;
	}
	.file-input {
		padding: 8px;
		border-radius: 4px;
		border: 1px solid rgba(255, 255, 255, 0.3);
		background: rgba(255, 255, 255, 0.1);
		color: inherit;
		cursor: pointer;
	}
	.button-group-inline {
		display: flex;
		gap: 8px;
	}
	.btn-edit-small {
		background: none;
		border: none;
		cursor: pointer;
		font-size: 18px;
		padding: 4px;
		opacity: 0.7;
		transition: opacity 0.2s;
	}
	.btn-edit-small:hover {
		opacity: 1;
	}
	.btn-save-small,
	.btn-cancel-small {
		padding: 6px 12px;
		border-radius: 4px;
		border: none;
		cursor: pointer;
		font-size: 14px;
		font-weight: 500;
		transition: opacity 0.2s;
	}
	.btn-save-small {
		background: var(--color-ganada, #4caf50);
		color: white;
	}
	.btn-cancel-small {
		background: rgba(255, 255, 255, 0.1);
		color: inherit;
	}
	.btn-save-small:hover,
	.btn-cancel-small:hover {
		opacity: 0.8;
	}
</style>
