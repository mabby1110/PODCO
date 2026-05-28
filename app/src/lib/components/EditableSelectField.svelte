<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';

	type Agente = {
		id: string | number;
		nombre: string;
	};

	let {
		id,
		id_agente = $bindable(),
		agentes = [],
		action = '/clientes?/update'
	}: {
		id: string;
		id_agente: string | number;
		agentes: Agente[];
		action?: string;
	} = $props();

	let isEditing = $state(false);
	let editedValue = $state(String(id_agente));
	let originalValue = String(id_agente);

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
				id_agente = editedValue;
				await invalidateAll();
			}
		};
	}

	const currentLabel = $derived(
		!id_agente
			? 'Sin asignar'
			: (agentes.find((a) => String(a.id) === String(id_agente))?.nombre ?? 'Sin información')
	);
</script>

<form method="POST" {action} use:enhance={handleSubmit}>
	<input type="hidden" name="id_cliente" value={id} />

	<section class="detail-block">
		<div class="detail-header">
			{#if !isEditing}
				<button type="button" class="btn-edit-small" onclick={toggleEdit}>✏️</button>
			{/if}
			<h3>Agente:</h3>
		</div>

		<div class="detail-body">
			{#if isEditing}
				<select name="id_agente" bind:value={editedValue} class="select">
					<option value="">— Sin asignar —</option>
					{#each agentes as agente}
						<option value={agente.id}>{agente.nombre}</option>
					{/each}
				</select>

				<div class="button-group-inline">
					<button type="submit" class="btn-save-small">Guardar</button>
					<button type="button" class="btn-cancel-small" onclick={toggleEdit}>Cancelar</button>
				</div>
			{:else}
				<p>{currentLabel}</p>
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
	}
	.detail-body {
		padding-left: var(--a);
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
