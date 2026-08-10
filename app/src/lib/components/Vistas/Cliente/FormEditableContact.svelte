<script lang="ts">
	import { enhance } from '$app/forms';

	// 1. Añadimos un arreglo vacío como valor por defecto en $bindable()
	let {
		lista = $bindable([]),
		id,
		id_agente,
		editando = false,
		action = '?/updateClient'
	} = $props();

	type ContactItem = {
		type: string;
		value: string;
	};

	type ContactData = {
		nombre: string;
		puesto: string;
		contactos: ContactItem[];
	};

	let showPersonForm = $state(false);

	let contact_name = $state('');
	let contact_position = $state('');
	let contact_type = $state('telefono');
	let contact_value = $state('');
	let contactos = $state<ContactItem[]>([]);

	let editIndex = $state<number | null>(null);
	let editPersonIndex = $state<number | null>(null);

	// Aseguramos que el valor derivado también maneje el caso de undefined
	let contacto_compuesto = $derived(lista || []);
	let formEl = $state<HTMLFormElement | null>(null);

	function openNewPerson() {
		editando = true;
		showPersonForm = true;
		resetPersonForm();
	}

	function editPersona(i: number) {
		const currentLista = lista || [];
		const p = currentLista[i];
		if (!p) return;
		editando = true;
		showPersonForm = true;
		editPersonIndex = i;
		contact_name = p.nombre;
		contact_position = p.puesto || '';
		contactos = [...p.contactos];
	}

	function confirmRemovePersona(i: number) {
		if (!confirm('Eliminar persona y sus contactos?')) return;

		// 2. Validación de seguridad al filtrar
		lista = (lista || []).filter((_, idx) => idx !== i);

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
		editando = false;
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

		// 3. Validación de seguridad antes de mapear o propagar
		const currentLista = lista || [];

		if (editPersonIndex !== null) {
			lista = currentLista.map((p, i) => (i === editPersonIndex ? persona : p));
		} else {
			lista = [...currentLista, persona];
		}

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
	<section>
		<input type="hidden" name="id_cliente" value={id} />
		<input type="hidden" name="contactos" value={JSON.stringify(contacto_compuesto)} />
		<div class="header">
			<h3 class="label">Contactos:</h3>
		</div>
		<div class="content">
			<div class="contact-list">
				{#if (lista || []).length > 0}
					{#each lista || [] as persona, i}
						<div class="person-card">
							<div class="contact-row">
								{#if editando}
									<div class="row-actions">
										<button type="button" class="btn-edit-small" onclick={() => editPersona(i)}
											>✏️</button
										>
										<button
											type="button"
											class="btn-del-small"
											onclick={() => confirmRemovePersona(i)}>🗑️</button
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
				{:else}
					<p>No hay contactos registrados</p>
				{/if}
			</div>
			{#if editando}
				{#if showPersonForm}
					<div class="form-persona panel">
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
								<span>Dato De Contacto</span>
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
									<button
										type="button"
										class="btn-del-small"
										onclick={() => confirmRemoveContacto(i)}>🗑️</button
									>
									<p>{c.type}: {c.value}</p>
								</div>
							{/each}
						</div>

						<div class="form-actions">
							<button type="button" class="butter" onclick={() => (showPersonForm = false)}>
								Cancelar
							</button>
							<button type="button" class="butter" onclick={submitPersonaLocal}>
								{editPersonIndex !== null ? 'Actualizar persona' : 'Agregar'}
							</button>
						</div>
					</div>
				{:else}
					<div class="form-actions">
						<button type="button" class="butter" onclick={openNewPerson}>Nueva persona</button>
						<button type="submit" class="butter matcha">Guardar</button>
					</div>
				{/if}
			{/if}
		</div>
	</section>
</form>

<style>
	.contact-list {
		display: flex;
		flex-wrap: wrap;
		min-width: 200px;
		gap: var(--a);
		align-self: flex-start;
	}
	.form-persona {
		width: 100%;
		padding: var(--a);
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
		flex-wrap: wrap;
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
	.form-actions {
		display: flex;
		flex-wrap: wrap;
		gap: var(--a);
		margin-top: var(--a);
		justify-content: flex-end;
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
