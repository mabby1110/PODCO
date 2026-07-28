<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { appState } from '$lib/stores/appState.svelte';
	import { opModalStore } from '$lib/stores/opModalStore.svelte';
	import { profile } from '$lib/stores/profileStore.svelte';
	import { formatDateFull, parseDateTimeLocal } from '$lib/utils/agenda';

	let {
		historia = $bindable('[]'),
		objId,
		action = '?/updateHistoria',
		isEditing = false
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

	function handleHotOp(i: number, entrada: string) {
		opModalStore.index_entrada = String(i);
		opModalStore.observaciones = entrada;
		appState.toggleModalOp();
	}
	// $effect(() => {
	// 	if (formInput) {
	// 		formInput.scrollIntoView({
	// 			behavior: 'smooth',
	// 			block: 'start'
	// 		});
	// 	}
	// });
</script>

<form bind:this={formEl} method="POST" {action} use:enhance={handleSubmit}>
	<input type="hidden" name="id" value={objId} />
	<input type="hidden" name="historia" value={list_stringified} />

	<div class="detail-body">
		<div class="entradas">
			{#if lista.length > 0}
				{#each lista as item, i}
					<div class="entrada">
						{#if editIndex === i}
							<label class="field-input">
								<span>Editar Entrada</span>
								<textarea bind:value={editData.entrada}></textarea>
							</label>
							<div class="form-actions">
								<button type="button" class="butter" onclick={saveEdit}>Guardar</button>
								<button type="button" class="butter chile" onclick={cancelEdit}>X</button>
							</div>
						{:else}
							{#if (item.nombre_perfil === $profile?.nombre && isEditing) || (!item.nombre_perfil && isEditing)}
								{#if !item.id_op}
									<button type="button" class="butter" onclick={()=>handleHotOp(i, item.entrada)}>
										+Oportundiad
									</button>
								{/if}
								<button type="button" class="btn-icon" onclick={() => editItem(i)}>✏️</button>
							{/if}
							<b>{formatDateFull(parseDateTimeLocal(item.fecha))}: </b>
							{#if item.entrada}
								<div class="contenido-entrada">
									{#if item.id_op}
										<a href="/oportunidades/{item.id_op}">Oportunidad</a>
									{/if}
									{#if item.nombre_perfil}
										<span class="profile">{item.nombre_perfil},</span>
									{/if}
									<p>{item.entrada}</p>
								</div>
							{/if}
						{/if}
					</div>
				{/each}
			{:else}
				<p class="empty-msg">No hay entradas</p>
			{/if}
		</div>
		<div class="entrada form-permanente">
			<label class="field-input">
				<textarea bind:value={newData.entrada} bind:this={formInput} placeholder="Nueva Entrada"
				></textarea>
			</label>
			<button type="button" class="butter btn-save-small" onclick={saveNew}>Guardar</button>
		</div>
	</div>
</form>

<style>
	.empty-msg {
		font-style: italic;
		margin: 16px 0;
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
	.detail-body {
		padding: var(--a);
		display: flex;
		gap: var(--a);
		flex-wrap: wrap;
		width: 100%;
		max-width: 1000px;
		pointer-events: none;
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
	.form-permanente {
		display: flex;
		align-items: flex-end;
		gap: var(--a);
		width: 100%;
	}
	.btn-save-small {
		background: var(--color-ganada, #4caf50);
		align-self: flex-end;
	}
	button,
	input,
	textarea,
	a {
		pointer-events: all;
	}
</style>
