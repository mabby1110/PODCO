<script lang="ts">
	import { enhance } from '$app/forms';

	let {
		jsonList = $bindable(),
		id,
		action = '?/updateList',
		name,
		label = 'Etiqueta',
		options = ['bombas', 'sellos']
	}: {
		jsonList: string;
		id: string;
		action?: string;
		name?: string;
		label?: string;
		options?: string[];
	} = $props();

	let lista = $state<string[]>(jsonList && jsonList !== '' ? JSON.parse(jsonList) : []);
	let isAdding = $state(false);
	let currentString = $state<string>('');

	let edit = $state(false);
	let list_stringified = $derived(JSON.stringify(lista));
	let formEl = $state<HTMLFormElement | null>(null);

	function openNewItem() {
		isAdding = true;
		currentString = '';
	}

	function cancel() {
		isAdding = false;
	}

	function saveItem() {
		const val = currentString.trim();
		if (!val) {
			cancel();
			return;
		}

		lista = [...lista, val];
		jsonList = list_stringified;
		cancel();
		queueMicrotask(() => formEl?.requestSubmit());
	}

	function removeItem(i: number) {
		if (!confirm('¿Eliminar elemento?')) return;
		lista = lista.filter((_, idx) => idx !== i);
		jsonList = list_stringified;
		cancel();
		queueMicrotask(() => formEl?.requestSubmit());
	}

	function handleSubmit() {
		return async ({ update }: any) => {
			await update();
		};
	}
</script>

{#if edit}
	<form bind:this={formEl} method="POST" {action} use:enhance={handleSubmit}>
		<input type="hidden" name="id" value={id} />
		<input type="hidden" {name} value={list_stringified} />

		<div class="chip-container">
			<button type="button" class="close-btn" onclick={() => (edit = false)}>✕</button>
			{#each lista as item, i}
				<div class="chip butter">
					<span>{item}</span>
					<button type="button" class="btn-icon" onclick={() => removeItem(i)}>🗑️</button>
				</div>
			{/each}

			{#if isAdding}
				<div class="chip-edit">
					<select bind:value={currentString} autofocus>
						<option value="" disabled>Seleccionar...</option>
						{#each options as opt}
							<option value={opt}>{opt}</option>
						{/each}
					</select>
					<button type="button" class="btn-icon" onclick={saveItem}>✓</button>
					<button type="button" class="btn-icon" onclick={cancel}>✕</button>
				</div>
			{:else}
				<button type="button" class="chip-add butter" onclick={openNewItem}>+ Agregar</button>
			{/if}
		</div>
	</form>
{:else}
	<div class="chip-container">
		{#each lista as item, i}
			<div class="chip">
				<span>{item}</span>
			</div>
		{/each}
		<button type="button" class="chip-add" onclick={() => (edit = true)}>+ editar</button>
	</div>
{/if}

<style>
	.chip-container {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		align-items: center;
		border-radius: 8px;
	}
	.chip {
		background-color: var(--color-secondary);
	}
	.chip-edit {
		display: flex;
        gap: var(--a);
		align-items: center;
	}
	.chip-edit select {
		background: transparent;
	}
	.chip-add {
		background: none;
		border: 1px dashed var(--color-contrast);
		border-radius: 16px;
		padding: 4px 12px;
		cursor: pointer;
		font-size: 14px;
		color: var(--color-muted);
	}
	.chip-add:hover {
		color: var(--color-primary);
		background-color: var(--color-contrast);
	}
	.btn-icon {
		background: none;
		border: none;
		cursor: pointer;
		font-size: 12px;
		padding: 2px;
		opacity: 0.6;
	}
	.btn-icon:hover {
		opacity: 1;
	}
</style>
