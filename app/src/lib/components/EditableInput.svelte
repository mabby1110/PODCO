<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidate, invalidateAll } from '$app/navigation';
	import { profile } from '$lib/stores/profileStore.svelte';
	import type { Snippet } from 'svelte';

	let {
		label,
		name,
		value = $bindable(),
		type = 'text',
		rows = 3,
		id,
		action = '/clientes?/updateClient',
		placeholder = '',
		hint = '',
		options = [],
		isEditing = false,
		header
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
		isEditing?: boolean;
		header?: Snippet;
	} = $props();
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
				originalValue = editedValue;
				value = editedValue;
				await invalidateAll();
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

{#if value || isEditing}
	<form method="POST" {action} use:enhance={handleSubmit}>
		<input type="hidden" name="id" value={id} />
		{#if header}
			{@render header()}
		{/if}
		<section class="container">
			<h3>{label}:</h3>
			{#if hint && !isEditing}
				<p class="hint">{hint}</p>
			{/if}

			{#if isEditing}
				<div class="detail-body">
					{#if type === 'textarea'}
						<textarea {name} bind:value={editedValue} {rows} {placeholder}></textarea>
					{:else if type === 'file'}
						<input type="file" {name} class="file-input" />
					{:else if type === 'select'}
						<select {name} bind:value={editedValue} class="select">
							<option value={editedValue ?? 'Sin Agente'}> seleccionar </option>
							{#each options as option}
								<option value={option.id}>
									{option.nombre}
								</option>
							{/each}
						</select>
					{:else}
						<input {type} {name} bind:value={editedValue} {placeholder} />
					{/if}
					<button type="submit" class="btn-save-small butter">Guardar</button>
				</div>
			{:else}
				<div class="detail-body">
					<p class="value">{editedValue || 'Sin información'}</p>
				</div>
			{/if}
		</section>
	</form>
{/if}

<style>
	form {
		grid-column: span 2;
		width: 100%;
	}
	.container {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
	}
	.detail-body {
		padding: var(--a);
		display: flex;
		gap: var(--a);
		flex-wrap: wrap;
		width: 100%;
		max-width: 1000px;
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
	input {
		flex-grow: 1;
	}
	select {
		cursor: pointer;
		transition: all 0.2s;
		flex-grow: 1;
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
		flex-grow: 1;
		min-width: 200px;
	}
	.file-input {
		padding: 8px;
		border-radius: 4px;
		border: 1px solid rgba(255, 255, 255, 0.3);
		background: rgba(255, 255, 255, 0.1);
		color: inherit;
		cursor: pointer;
	}
	.select {
		width: fit-content;
	}
</style>
