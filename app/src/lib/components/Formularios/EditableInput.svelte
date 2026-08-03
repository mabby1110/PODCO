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
		isEditing = false,
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
		isEditing?: boolean;
		header?: Snippet;
	} = $props();

	let editedValue = $state(value);
	let isSubmitting = $state(false);

	function handleSubmit() {
		isSubmitting = true;
		return async ({ result }: any) => {
			if (result.type === 'success') {
				value = editedValue;
				await invalidateAll();
			}
			isSubmitting = false;
		};
	}

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
		{#if id_agente}
			<input type="hidden" name="id_agente" value={id_agente} />
		{/if}
		<section>
			<div class="header">
				<h3>{label}:</h3>
				{#if hint && !isEditing}
					<p class="hint">{hint}</p>
				{/if}
			</div>

			{#if isEditing}
				<div class="content">
					{#if type === 'textarea'}
						<textarea {name} bind:value={editedValue} {rows} {placeholder}></textarea>
					{:else if type === 'file'}
						<input type="file" {name} class="file-input" />
					{:else if type === 'select'}
						<select {name} bind:value={editedValue} class="select">
							<option value=""> seleccionar </option>
							{#each options as option}
								<option value={option.id}>
									{option.nombre}
								</option>
							{/each}
						</select>
					{:else}
						<input {type} {name} bind:value={editedValue} {placeholder} />
					{/if}
					<button
						type="submit"
						class="butter matcha"
						disabled={isSubmitting}
						style:opacity={isSubmitting ? 0.5 : 1}
						style:cursor={isSubmitting ? 'not-allowed' : 'pointer'}
					>
						Guardar
					</button>
				</div>
			{:else}
				<div class="content">
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
