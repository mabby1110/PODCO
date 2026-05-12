<script lang="ts">
	import { enhance } from '$app/forms';
	import { profile } from '$lib/stores/profileStore.svelte';
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
		// Inyección de la propiedad
		currentItem['nombre_perfil'] = $profile.nombre;

		if (editIndex !== null) {
			lista[editIndex] = { ...currentItem };
		} else if (isAdding) {
			lista = [...lista, { ...currentItem }];
		}
		jsonList = list_stringified;
		cancel();
		queueMicrotask(() => formEl?.requestSubmit());
	}

	// function removeItem(i: number) {
	// 	if (!confirm('¿Eliminar elemento?')) return;
	// 	lista = lista.filter((_, idx) => idx !== i);
	// 	jsonList = list_stringified;
	// 	cancel();
	// 	queueMicrotask(() => formEl?.requestSubmit());
	// }

	function handleSubmit() {
		return async ({ update }: any) => {
			await update();
		};
	}
</script>

<form bind:this={formEl} method="POST" {action} use:enhance={handleSubmit}>
	<input type="hidden" name="id" value={id} />
	<input type="hidden" {name} value={list_stringified} />

	<div class="entradas">
		{#each lista as item, i}
			<div class="entrada">
				{#if editIndex === i}
					{#each fields as field}
						{#if field.type === 'textarea'}
							<label class="field-input">
								<span>{field.label}</span>
								<textarea bind:value={currentItem[field.name]}></textarea>
							</label>
						{:else if field.type === 'select' && field.options}
							<label class="field-input">
								<span>{field.label}</span>
								<select bind:value={currentItem[field.name]}>
									<option value="">Seleccionar</option>
									{#each field.options as opt}
										<option value={opt.value}>{opt.label}</option>
									{/each}
								</select>
							</label>
						{:else if field.type === 'date'}
							<input type="hidden" bind:value={currentItem[field.name]} />
						{:else}
							<label class="field-input">
								<span>{field.label}</span>
								<input type={field.type || 'text'} bind:value={currentItem[field.name]} />
							</label>
						{/if}
					{/each}
					<div class="form-actions">
						<button type="button" class="butter" onclick={saveItem}>Guardar</button>
						<!-- <button type="button" class="btn-icon" onclick={() => removeItem(i)}>🗑️</button> -->
						<button type="button" class="close-btn" onclick={cancel}>X</button>
					</div>
				{:else}
					<button type="button" class="btn-icon" onclick={() => editItem(i)}>✏️</button>
					{#each fields as field, fIndex}
						{#if fIndex === 0}
							{#if field.type === 'date'}
								<b>{formatDateFull(parseDateTimeLocal(item.fecha))}: </b>

								{#if item.nombre_perfil}
									<p class="profile">{item.nombre_perfil}, </p>
								{/if}
							{:else}
								<b>{item[field.name]}: </b>
							{/if}
						{:else}
							<span>{item[field.name]}</span>
						{/if}
					{/each}
				{/if}
			</div>
		{/each}

		{#if isAdding}
			<div class="entrada">
				{#each fields as field}
					{#if field.type === 'textarea'}
						<label class="field-input">
							<span>{field.label}</span>
							<textarea bind:value={currentItem[field.name]}></textarea>
						</label>
					{:else if field.type === 'select' && field.options}
						<label class="field-input">
							<span>{field.label}</span>
							<select bind:value={currentItem[field.name]}>
								<option value="">Seleccionar</option>
								{#each field.options as opt}
									<option value={opt.value}>{opt.label}</option>
								{/each}
							</select>
						</label>
					{:else if field.type === 'date'}
						<input type="hidden" bind:value={currentItem[field.name]} />
					{:else}
						<label class="field-input">
							<span>{field.label}</span>
							<input type={field.type || 'text'} bind:value={currentItem[field.name]} />
						</label>
					{/if}
				{/each}
				<div class="form-actions">
					<button type="button" class="butter" onclick={saveItem}>Guardar</button>
					<button type="button" class="butter" onclick={cancel}>Cancelar</button>
				</div>
			</div>
		{/if}

		{#if editIndex === null && !isAdding}
			<button type="button" class="butter" onclick={openNewItem}>+ Agregar entrada</button>
		{/if}
	</div>
</form>

<style>
	.entradas {
		padding: 8px;
		border: 1px solid var(--color-contrast, #ccc);
		border-radius: 8px;
	}
	.field-input {
		display: flex;
		flex-grow: 1;
	}
	.form-actions {
		display: flex;
		align-self: flex-end;
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
