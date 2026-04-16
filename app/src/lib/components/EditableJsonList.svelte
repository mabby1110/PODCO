<script lang="ts">
	import { enhance } from '$app/forms';
	import { formatDateFull, parseDateTimeLocal } from '$lib/utils/agenda';

	type FieldDef = {
		name: string;
		label: string;
		type?: 'text' | 'number' | 'date' | 'textarea' | 'select';
		options?: { value: string | number; label: string }[];
	};

	let {
		jsonList = $bindable(),
		id,
		action = '?/updateList',
		name,
		fields = []
	}: {
		jsonList: string;
		id: string;
		action?: string;
		name?: string;
		fields: FieldDef[];
	} = $props();

	let lista = $state<Record<string, any>[]>(
		jsonList && jsonList !== '' ? JSON.parse(jsonList) : []
	);
	let editIndex = $state<number | null>(null);
	let isAdding = $state(false);
	let currentItem = $state<Record<string, any>>({});

	let list_stringified = $derived(JSON.stringify(lista));
	let formEl = $state<HTMLFormElement | null>(null);

	function resetForm() {
		currentItem = {};
		for (const f of fields) {
			currentItem[f.name] = f.type === 'date' ? new Date().toISOString() : '';
		}
	}

	function openNewItem() {
		isAdding = true;
		editIndex = null;
		resetForm();
	}

	function editItem(i: number) {
		editIndex = i;
		isAdding = false;
		currentItem = { ...lista[i] };
	}

	function cancel() {
		editIndex = null;
		isAdding = false;
	}

	function saveItem() {
		if (editIndex !== null) {
			lista[editIndex] = { ...currentItem };
		} else if (isAdding) {
			lista = [...lista, { ...currentItem }];
		}
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

<form bind:this={formEl} method="POST" {action} use:enhance={handleSubmit}>
	<input type="hidden" name="id" value={id} />
	<input type="hidden" {name} value={list_stringified} />

	<div class="list-container">
		{#each lista as item, i}
			<div class="list-item">
				{#if editIndex === i}
					<div class="inline-form">
						{#each fields as field}
							<label class="field-input">
								{#if field.type === 'textarea'}
									<span>{field.label}</span>
									<textarea bind:value={currentItem[field.name]}></textarea>
								{:else if field.type === 'select' && field.options}
									<span>{field.label}</span>
									<select bind:value={currentItem[field.name]}>
										<option value="">Seleccionar</option>
										{#each field.options as opt}
											<option value={opt.value}>{opt.label}</option>
										{/each}
									</select>
								{:else if field.type === 'date'}
									<input type="hidden" bind:value={currentItem[field.name]} />
								{:else}
									<span>{field.label}</span>
									<input type={field.type || 'text'} bind:value={currentItem[field.name]} />
								{/if}
							</label>
						{/each}
						<div class="form-actions">
							<button type="button" class="butter" onclick={saveItem}>Guardar</button>
							<!-- <button type="button" class="btn-icon" onclick={() => removeItem(i)}>🗑️</button> -->
							<button type="button" class="close-btn" onclick={cancel}>X</button>
						</div>
					</div>
				{:else}
					<div class="item-content">
						<div class="item-text">
							{#each fields as field, fIndex}
								{#if fIndex === 0}
									{#if field.type === 'date'}
										<b>{formatDateFull(parseDateTimeLocal(item.fecha))}: </b>
									{:else}
										<b>{item[field.name]}: </b>
									{/if}
								{:else}
									<span>{item[field.name]}</span>
								{/if}
							{/each}
						</div>
						<button type="button" class="btn-icon" onclick={() => editItem(i)}>✏️</button>
					</div>
				{/if}
			</div>
		{/each}

		{#if isAdding}
			<div class="list-item inline-form">
				{#each fields as field}
					<label class="field-input">
						{#if field.type === 'textarea'}
							<span>{field.label}</span>
							<textarea bind:value={currentItem[field.name]}></textarea>
						{:else if field.type === 'select' && field.options}
							<span>{field.label}</span>
							<select bind:value={currentItem[field.name]}>
								<option value="">Seleccionar</option>
								{#each field.options as opt}
									<option value={opt.value}>{opt.label}</option>
								{/each}
							</select>
						{:else if field.type === 'date'}
							<input type="hidden" bind:value={currentItem[field.name]} />
						{:else}
							<span>{field.label}</span>
							<input type={field.type || 'text'} bind:value={currentItem[field.name]} />
						{/if}
					</label>
				{/each}
				<div class="form-actions">
					<button type="button" class="butter" onclick={saveItem}>Guardar</button>
					<button type="button" class="close-btn" onclick={cancel}>X</button>
				</div>
			</div>
		{/if}

		{#if editIndex === null && !isAdding}
			<button type="button" class="butter" onclick={openNewItem}>+ Agregar entrada</button>
		{/if}
	</div>
</form>

<style>
	.list-container {
		display: flex;
		flex-direction: column;
		gap: var(--a, 8px);
	}

	.list-item {
		display: flex;
		flex-direction: column;
	}

	.item-content {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 8px;
	}

	.item-text {
		word-break: break-word;
	}

	.inline-form {
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding: 8px;
		border: 1px solid var(--color-contrast, #ccc);
		border-radius: 8px;
	}

	.field-input {
		display: flex;
		flex-direction: column;
		gap: 4px;
		font-size: 14px;
	}

	.form-actions {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: 8px;
		margin-top: 4px;
	}

	.btn-icon {
		background: none;
		border: none;
		cursor: pointer;
		font-size: 16px;
		padding: 4px;
		opacity: 0.7;
	}

	.btn-icon:hover {
		opacity: 1;
	}
</style>
