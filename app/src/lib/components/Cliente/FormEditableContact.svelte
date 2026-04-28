<script lang="ts">
	import { enhance } from '$app/forms';

	let { jsonList = $bindable(), id, action = '?/updateClient' } = $props();

	type ContactItem = {
		type: string;
		value: string;
	};

	type ContactData = {
		nombre: string;
		puesto: string;
		contactos: ContactItem[];
	};

	let lista = $state<ContactData[]>(jsonList && jsonList !== '' ? JSON.parse(jsonList) : []);

	let isEditing = $state(false);
	let showPersonForm = $state(false);

	let contact_name = $state('');
	let contact_position = $state('');
	let contact_type = $state('telefono');
	let contact_value = $state('');
	let contactos = $state<ContactItem[]>([]);

	let editIndex = $state<number | null>(null);
	let editPersonIndex = $state<number | null>(null);

	let contacto_compuesto = $derived(JSON.stringify(lista));
	let formEl = $state<HTMLFormElement | null>(null);

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
		contact_position = p.puesto || '';
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
		contact_position = '';
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
		const newContact = { type: contact_type, value: contact_value };

		if (editIndex !== null) {
			contactos = contactos.map((c, i) => (i === editIndex ? newContact : c));
		} else {
			contactos = [...contactos, newContact];
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
		const persona = { nombre: contact_name, puesto: contact_position, contactos };

		if (editPersonIndex !== null) {
			lista = lista.map((p, i) => (i === editPersonIndex ? persona : p));
		} else {
			lista = [...lista, persona];
		}

		jsonList = contacto_compuesto;
		showPersonForm = false;
		resetPersonForm();
	}

	function handleSubmit() {
		return async ({ update }: any) => {
			await update();
			cancelAll();
		};
	}
</script>

<form bind:this={formEl} method="POST" {action} use:enhance={handleSubmit}>
	<input type="hidden" name="id" value={id} />
	<input type="hidden" name="contactos" value={contacto_compuesto} />

	<div class="detail-header">
		{#if !isEditing}
			<button type="button" class="btn-edit-small" onclick={() => (isEditing = true)}>✏️</button>
		{/if}
		<h3 class="label">Contactos:</h3>
	</div>
	<div class="detail-body">
		{#if lista.length === 0}
			<p class="value">Sin información</p>
		{/if}
		<div class="contact-list">
			{#each lista as persona, i}
				<div class="person-card">
					<div class="contact-row">
						{#if isEditing}
							<div class="row-actions">
								<button type="button" class="btn-edit-small" onclick={() => editPersona(i)}
									>✏️</button
								>
								<button type="button" class="btn-del-small" onclick={() => confirmRemovePersona(i)}
									>🗑️</button
								>
							</div>
						{/if}
						<strong>{persona.nombre}</strong>
						{#if persona.puesto}
							<span class="puesto-badge">{persona.puesto}</span>
						{/if}
					</div>
					{#each persona.contactos as c}
						<div>{c.type}: {c.value}</div>
					{/each}
				</div>
			{/each}

			{#if isEditing}
				<div class="form-actions">
					<button type="button" class="butter" onclick={openNewPerson}>Nueva persona</button>
					<button type="button" class="butter" onclick={cancelAll}>Cerrar edición</button>
					<button type="submit" class="butter">Guardar cambios</button>
				</div>
			{/if}
		</div>
		{#if showPersonForm}
			<div class="person-form">
				<label class="field">
					<span>Nombre</span>
					<input bind:value={contact_name} />
				</label>
				<label class="field">
					<span>Puesto</span>
					<input bind:value={contact_position} />
				</label>

				<div class="new-contact">
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
							<button type="button" class="btn-edit-small" onclick={() => editContacto(i)}
								>✏️</button
							>
							<button type="button" class="btn-del-small" onclick={() => confirmRemoveContacto(i)}
								>🗑️</button
							>
							<p>{c.type}: {c.value}</p>
						</div>
					{/each}
				</div>

				<div class="form-actions">
					<button type="button" class="butter" onclick={submitPersonaLocal}>
						{editPersonIndex !== null ? 'Actualizar persona' : 'Guardar persona'}
					</button>
					<button type="button" class="butter" onclick={() => (showPersonForm = false)}
						>Cancelar</button
					>
				</div>
			</div>
		{/if}
	</div>
</form>

<style>
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
		border-radius: 12px;
		border: 1px solid var(--color-secondary);
	}

	.contact-row {
		display: flex;
		gap: var(--a);
		align-items: center;
	}
	.new-contact {
		display: flex;
		gap: var(--a);
		align-items: flex-end;
	}
	.row-actions {
		display: flex;
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
		padding: var(--b);
		border-radius: 12px;
		border: 1px solid var(--color-contrast);
	}

	.form-actions {
		display: flex;
		gap: var(--a);
		margin-top: var(--a);
	}

	.puesto-badge {
		color: #555;
		font-style: italic;
	}

	.btn-edit-small,
	.btn-del-small {
		background: none;
		border: none;
		cursor: pointer;
		font-size: 18px;
		padding: 4px;
		opacity: 0.7;
	}

	.btn-edit-small:hover,
	.btn-del-small:hover {
		opacity: 1;
	}
</style>
