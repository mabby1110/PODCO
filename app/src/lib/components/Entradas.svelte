<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { profile } from '$lib/stores/profileStore.svelte';
	import { formatDateFull, parseDateTimeLocal } from '$lib/utils/agenda';

	let {
		historia = $bindable('[]'),
		objId,
		action = '?/updateHistoria',
		isEditing = false,
	}: {
		historia: string;
		objId: string;
		action?: string;
		isEditing?: boolean;
	} = $props();

	let lista = $state<Record<string, any>[]>(
		historia && historia !== '' ? JSON.parse(historia) : []
	);

	let editIndex = $state<number | null>(null);
	let editData = $state<Record<string, any>>({});
	let newData = $state({
		fecha: new Date().toISOString(),
		entrada: ''
	});

	let list_stringified = $derived(JSON.stringify(lista));
	let formEl = $state<HTMLFormElement | null>(null);
	let formInput = $state<HTMLFormElement | null>(null);

	function initNewData() {
		newData = {
			fecha: new Date().toISOString(),
			entrada: ''
		};
	}

	function editItem(i: number) {
		editIndex = i;
		editData = { ...lista[i] };
	}

	function cancelEdit() {
		editIndex = null;
	}

	function saveEdit() {
		editData.nombre_perfil = $profile?.nombre;
		editData.id = $profile?.id;
		lista[editIndex as number] = { ...editData };
		syncAndSubmit();
		cancelEdit();
	}

	function saveNew() {
		if (!newData.entrada.trim()) return;

		const entry = {
			...newData,
			nombre_perfil: $profile?.nombre,
			id: $profile?.id
		};

		lista = [...lista, entry];
		syncAndSubmit();
		invalidateAll();
		initNewData();
	}

	function syncAndSubmit() {
		historia = list_stringified;
		queueMicrotask(() => formEl?.requestSubmit());
	}

	function handleSubmit() {
		return async ({ update }: any) => {
			await update();
		};
	}

	$effect(() => {
		if (formInput) {
			formInput.scrollIntoView({
				behavior: 'smooth',
				block: 'start'
			});
		}
	});
</script>

<div class="historia">
	{#if isEditing}
		<button type="button" class="close-btn" onclick={() => (isEditing = false)}>✕</button>
	{/if}
	<form bind:this={formEl} method="POST" {action} use:enhance={handleSubmit}>
		<input type="hidden" name="id" value={objId} />
		<input type="hidden" name="historia" value={list_stringified} />
	
		<div class="entradas">
			{#each lista as item, i}
				<div class="entrada">
					{#if editIndex === i}
						<label class="field-input">
							<span>Editar Entrada</span>
							<textarea bind:value={editData.entrada}></textarea>
						</label>
						<div class="form-actions">
							<button type="button" class="butter" onclick={saveEdit}>Guardar</button>
							<button type="button" class="close-btn" onclick={cancelEdit}>X</button>
						</div>
					{:else}
						{#if (item.nombre_perfil === $profile?.nombre && isEditing) || (!item.nombre_perfil && isEditing)}
							<button type="button" class="btn-icon" onclick={() => editItem(i)}>✏️</button>
						{/if}
						<b>{formatDateFull(parseDateTimeLocal(item.fecha))}: </b>
						{#if item.nombre_perfil}
							<span class="profile">{item.nombre_perfil},</span>
						{/if}
						<p>{item.entrada}</p>
					{/if}
				</div>
			{/each}
	
			<div class="entrada form-permanente">
				{#if isEditing}
					<label class="field-input">
						<span>Nueva Entrada</span>
						<textarea bind:value={newData.entrada} bind:this={formInput}></textarea>
					</label>
					<div class="form-actions">
						<button type="button" class="butter" onclick={saveNew}>Guardar</button>
					</div>
				{:else}
					<button type="button" class="butter" onclick={() => (isEditing = true)}
						>Agregar Entrada</button
					>
				{/if}
			</div>
		</div>
	</form>
</div>

<style>
	.historia {
		display: flex;
		align-items: flex-start;
		height: fit-content;
		gap: var(--a);
	}
	.historia .close-btn {
		align-self: flex-start;
	}
	.empty-msg {
		font-style: italic;
		margin-bottom: 16px;
	}
	.field-input {
		display: flex;
		flex-direction: column;
		flex-grow: 1;
	}
	.field-input textarea {
		margin-top: 4px;
		min-height: 60px;
	}
	.form-actions {
		display: flex;
		align-self: flex-end;
		justify-content: flex-end;
		gap: 8px;
		margin-top: 8px;
	}
	.profile {
		font-style: italic;
		margin-right: 4px;
	}
	.btn-icon:hover {
		opacity: 1;
	}
	.butter {
		aspect-ratio: unset;
	}
</style>
