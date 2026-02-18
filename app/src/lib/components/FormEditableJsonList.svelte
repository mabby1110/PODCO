<script lang="ts">
	import { enhance } from '$app/forms';

	let { label = '', name = '', jsonList = $bindable(), id, action = '?/updateClient' } = $props();

	type ContactItem = {
		type: string;
		value: string;
	};

	type ContactData = {
		nombre: string;
		contactos: ContactItem[];
	};

	let lista = $state<ContactData[]>(jsonList && jsonList !== '' ? JSON.parse(jsonList) : []);

	let isEditing = $state(false);
	let showPersonForm = $state(false);

	let contact_name = $state('');
	let contact_type = $state('telefono');
	let contact_value = $state('');
	let contactos = $state<ContactItem[]>([]);

	let editIndex = $state<number | null>(null);
	let editPersonIndex = $state<number | null>(null);

	let contacto_compuesto = $derived(JSON.stringify(lista));

	function openNewPerson() {
		isEditing = true;
		showPersonForm = true;
		resetPersonForm();
	}

	function editPersona(i: number) {
		const p = lista[i];
		if (!p) return;
		isEditing = true;
		showPersonForm = true;
		editPersonIndex = i;
		contact_name = p.nombre;
		contactos = [...p.contactos];
	}

	function confirmRemovePersona(i: number) {
		if (!confirm('Eliminar persona y sus contactos?')) return;
		lista = lista.filter((_, idx) => idx !== i);
		jsonList = contacto_compuesto;
		queueMicrotask(() => formEl?.requestSubmit());
	}

	function resetForm() {
		contact_type = 'telefono';
		contact_value = '';
		editIndex = null;
	}

	function resetPersonForm() {
		contact_name = '';
		contactos = [];
		editPersonIndex = null;
		resetForm();
	}

	function cancelAll() {
		isEditing = false;
		showPersonForm = false;
		resetPersonForm();
	}

	function submitContacto() {
		if (!contact_type || !contact_value) return;
		if (editIndex !== null) {
			contactos = contactos.map((c, i) =>
				i === editIndex ? { type: contact_type, value: contact_value } : c
			);
		} else {
			contactos = [...contactos, { type: contact_type, value: contact_value }];
		}
		resetForm();
	}

	function editContacto(i: number) {
		const c = contactos[i];
		if (!c) return;
		contact_type = c.type;
		contact_value = c.value;
		editIndex = i;
	}

	function confirmRemoveContacto(i: number) {
		if (!confirm('Eliminar contacto?')) return;
		contactos = contactos.filter((_, idx) => idx !== i);
		if (editIndex === i) resetForm();
	}

	function submitPersonaLocal() {
		if (!contact_name) return;
		const persona = { nombre: contact_name, contactos };
		if (editPersonIndex !== null) {
			lista = lista.map((p, i) => (i === editPersonIndex ? persona : p));
		} else {
			lista = [...lista, persona];
		}
		jsonList = contacto_compuesto;
	}

	let formEl: HTMLFormElement | null = null;

	function handleSubmit() {
		return async ({ update }: any) => {
			await update();
			cancelAll();
		};
	}
</script>

<form bind:this={formEl} method="POST" {action} use:enhance={handleSubmit}>
	<input type="hidden" name="id" value={id} />
	<input type="hidden" {name} value={contacto_compuesto} />

	<div class="detail-block">
		<div class="detail-header">
			<h3 class="label">{label}:</h3>
			{#if !isEditing}
				<button type="button" class="btn-edit-small" onclick={() => (isEditing = true)}>✏️</button>
			{/if}
		</div>

		<div class="detail-body">
			{#if isEditing && showPersonForm}
				<div class="person-form">
					<label class="field">
						<span>Nombre</span>
						<input bind:value={contact_name} />
					</label>

					<div class="contact-row">
						<label class="field">
							<span>Contacto</span>
							<input bind:value={contact_value} />
						</label>

						<label class="field">
							<span>Medio</span>
							<select bind:value={contact_type}>
								<option value="telefono">Teléfono</option>
								<option value="whatsapp">WhatsApp</option>
								<option value="email">Correo</option>
								<option value="linkedin">LinkedIn</option>
								<option value="otro">Otro</option>
							</select>
						</label>

						<button type="button" class="butter" onclick={submitContacto}>
							{editIndex !== null ? 'Actualizar contacto' : 'Agregar contacto'}
						</button>

						{#if editIndex !== null}
							<button type="button" class="butter" onclick={resetForm}>Cancelar</button>
						{/if}
					</div>

					<div class="contact-list">
						{#each contactos as c, i}
							<div class="contact-row">
								<span>{c.type}: {c.value}</span>
								<button type="button" class="btn-edit-small" onclick={() => editContacto(i)}>✏️</button>
								<button type="button" class="btn-del-small" onclick={() => confirmRemoveContacto(i)}>🗑️</button>
							</div>
						{/each}
					</div>

					<div class="form-actions">
						<button
							type="submit"
							class="butter"
							onclick={submitPersonaLocal}>
							{editPersonIndex !== null ? 'Actualizar persona' : 'Agregar persona'}
						</button>
						<button type="button" class="butter" onclick={cancelAll}>Cancelar</button>
					</div>
				</div>
			{:else}
				{#if lista.length > 0}
					<div class="contact-list">
						{#each lista as persona, i}
							<div class="person-card">
								<div class="contact-row">
									<strong>{persona.nombre}</strong>
									{#if isEditing}
										<button type="button" class="btn-edit-small" onclick={() => editPersona(i)}>✏️</button>
										<button type="button" class="btn-del-small" onclick={() => confirmRemovePersona(i)}>🗑️</button>
									{/if}
								</div>
								{#each persona.contactos as c}
									<div>{c.type}: {c.value}</div>
								{/each}
							</div>
						{/each}

						{#if isEditing}
							<button type="button" class="butter" onclick={openNewPerson}>
								Nueva persona
							</button>
							<button type="button" class="butter" onclick={cancelAll}>
								Cerrar
							</button>
						{/if}
					</div>
				{:else}
					{#if isEditing}
						<button type="button" class="butter" onclick={openNewPerson}>
							Nueva persona
						</button>
						<button type="button" class="butter" onclick={cancelAll}>
							Cerrar
						</button>
					{:else}
						<p class="value">Sin información</p>
					{/if}
				{/if}
			{/if}
		</div>
	</div>
</form>

<style>
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
		display: flex;
		flex-direction: column;
		gap: var(--b);
		padding-left: var(--b);
	}

	.label {
		font-size: 20px;
	}

	.contact-list {
		display: flex;
		flex-direction: column;
		gap: var(--a);
	}

	.person-card {
		display: flex;
		flex-direction: column;
		gap: var(--a);
		padding: var(--a);
		border: 1px solid #ddd;
	}

	.contact-row {
		display: flex;
		flex-wrap: wrap;
		gap: var(--a);
		align-items: center;
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: var(--a);
	}

	.person-form {
		display: flex;
		flex-direction: column;
		gap: var(--b);
	}

	.form-actions {
		display: flex;
		gap: var(--a);
	}

	.btn-edit-small,
	.btn-del-small {
		background: none;
		border: none;
		cursor: pointer;
		font-size: 16px;
		opacity: 0.7;
	}

	.btn-edit-small:hover,
	.btn-del-small:hover {
		opacity: 1;
	}
</style>
