<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import type { Snippet } from 'svelte';

	let {
		label,
		name,
		value = $bindable(),
		type = 'text',
		rows = 3,
		id,
		id_agente,
		action = '/clientes?/updateClient',
		placeholder = '',
		hint = '',
		options = [],
		editando = false,
		header
	}: {
		label: string;
		name: string;
		value: string;
		type?: 'text' | 'textarea' | 'file' | 'email' | 'number' | 'date' | 'select';
		rows?: number;
		id: string;
		id_agente?: boolean;
		action?: string;
		placeholder?: string;
		hint?: string;
		options?: Array<{ id: string | number; nombre: string }>;
		editando?: boolean;
		header?: Snippet;
	} = $props();

	let editedValue = $state(value);
	let isEditing = $derived(editando);
	let isSubmitting = $state(false);

	$effect(() => {
		if (!isEditing) {
			editedValue = value;
		}
	});

	function startEditing() {
		editedValue = value;
		isEditing = true;
	}

	function handleSubmit() {
		isSubmitting = true;

		return async ({ result }: any) => {
			if (result.type === 'success') {
				value = editedValue;
				isEditing = false;
				await invalidateAll();
			}

			isSubmitting = false;
		};
	}

	$effect(() => {
		if (type === 'select' && !isEditing && options.length > 0) {
			const selectedOption = options.find((option) => option.id == value);

			if (selectedOption) {
				editedValue = String(selectedOption.id);
			}
		}
	});
</script>

{#if value || isEditing || editando}
	<form method="POST" {action} use:enhance={handleSubmit}>
		<input type="hidden" name="id" value={id} />

		{#if id_agente}
			<input type="hidden" name="id_agente" value={id_agente} />
		{/if}

		<section>
			<div class="section-header">
				<h3>{label}:</h3>
				{#if hint && !isEditing}
					<p class="hint">{hint}</p>
				{/if}
			</div>

			{#if isEditing}
				<div class="section-content">
					<button class="jelly rojo accion" type="button" onclick={() => (isEditing = !isEditing)}
						>✕</button
					>
					<div class="content">
						{#if type === 'textarea'}
							<textarea {name} bind:value={editedValue} {rows} {placeholder}></textarea>
						{:else if type === 'file'}
							<input type="file" {name} class="file-input" />
						{:else if type === 'select'}
							<select {name} bind:value={editedValue} class="select">
								<option value="">Seleccionar</option>
								{#each options as option}
									<option value={option.id}>{option.nombre}</option>
								{/each}
							</select>
						{:else}
							<input {type} {name} bind:value={editedValue} {placeholder} />
						{/if}
					</div>
					<button type="submit" class="butter accion" disabled={isSubmitting}> Guardar </button>
				</div>
			{:else}
				<div class="section-content">
					<p class="value editable" ondblclick={startEditing} title="Doble clic para editar">
						{#if type === 'select'}
							{options.find((option) => String(option.id) === String(value))?.nombre ??
								'Sin información'}
						{:else}
							{value || 'Sin información'}
						{/if}
					</p>
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
	.editable {
		cursor: pointer;
		border-radius: 4px;
		padding: 4px;
	}
	.editable:hover {
		background: rgba(255, 255, 255, 0.08);
	}
	.content {
		flex-grow: 1;
		display: flex;
		align-items: center;
		gap: 8px;
	}
	input,
	select,
	textarea {
		flex-grow: 1;
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
