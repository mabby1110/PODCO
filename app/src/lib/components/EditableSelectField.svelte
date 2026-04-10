<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidate } from '$app/navigation';
	import { profile } from '$lib/stores/profileStore.svelte';

	type Option = {
		id: string | number;
		nombre: string;
	};

	let {
		label,
		name,
		id,
		value = $bindable(),
		options = [],
		action = '?/updateClient',
		hint = ''
	}: {
		label: string;
		name: string;
		id: string;
		value: string | number;
		options: Option[];
		action?: string;
		hint?: string;
	} = $props();

	let isEditing = $state(false);
	let editedValue = $state(String(value));
	let originalValue = String(value);

	function toggleEdit(e: Event) {
		e.stopPropagation();
		isEditing = !isEditing;
		if (!isEditing) editedValue = originalValue;
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

	const currentLabel = $derived(
		!value
			? 'Sin asignar'
			: (options.find((o) => String(o.id) === String(value))?.nombre ?? 'Sin información')
	);
</script>

<form method="POST" {action} use:enhance={handleSubmit}>
	<input type="hidden" name="id" value={id} />
	<input type="hidden" name="field" value={name} />

	<section class="detail-block">
		<div class="detail-header">
			<h3>{label}:</h3>
			{#if !isEditing && $profile?.isAdmin}
				<button type="button" class="btn-edit-small" onclick={toggleEdit}>✏️</button>
			{/if}
		</div>

		<div class="detail-body">
			{#if hint && !isEditing}
				<p class="hint">{hint}</p>
			{/if}

			{#if isEditing && $profile?.isAdmin}
				<select {name} bind:value={editedValue} class="select">
					<option value="">— Sin asignar —</option>
					{#each options as opt}
						<option value={String(opt.id)}>{opt.nombre}</option>
					{/each}
				</select>

				<div class="button-group-inline">
					<button type="submit" class="btn-save-small">Guardar</button>
					<button type="button" class="btn-cancel-small" onclick={toggleEdit}>Cancelar</button>
				</div>
			{:else}
				<input type="hidden" {name} value={$profile?.isAdmin ? value : $profile?.id} />
				<p class="value">{currentLabel}</p>
			{/if}
		</div>
	</section>
</form>

<style>
	form {
		width: 100%;
	}
	.detail-block {
		display: flex;
		flex-direction: column;
		gap: var(--a);
	}
	.detail-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.detail-body {
		padding-left: var(--b);
		display: flex;
		gap: var(--a);
		flex-wrap: wrap;
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

	select {
		cursor: pointer;
		background: rgba(255, 255, 255, 0.1);
		border: 1px solid rgba(255, 255, 255, 0.3);
		border-radius: 4px;
		padding: 6px 10px;
	}

	.select:focus {
		outline: none;
		border-color: var(--color-secondary, #fff);
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
	}

	.btn-save-small {
		background: var(--color-ganada, #4caf50);
	}
	.btn-cancel-small {
		background: rgba(255, 255, 255, 0.1);
		color: inherit;
	}
</style>
