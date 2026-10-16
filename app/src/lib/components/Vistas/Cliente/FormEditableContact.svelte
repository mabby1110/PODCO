<script lang="ts">
	import { enhance } from '$app/forms';

	type ContactItem = {
		type: string;
		value: string;
	};

	type ContactData = {
		nombre: string;
		puesto: string;
		contactos: ContactItem[];
	};

	let {
		lista = $bindable<ContactData[]>([]),
		id,
		id_agente,
		editando = false,
		action = '?/updateClient'
	}: {
		lista?: ContactData[];
		id: string;
		id_agente?: string | boolean;
		editando?: boolean;
		action?: string;
	} = $props();

	let showPersonForm = $state(false);
	let isEditing = $state(editando);
	let contact_name = $state('');
	let contact_position = $state('');
	let contact_type = $state('telefono');
	let contact_value = $state('');
	let contactos = $state<ContactItem[]>([]);
	let editIndex = $state<number | null>(null);
	let editPersonIndex = $state<number | null>(null);
	let formEl = $state<HTMLFormElement | null>(null);

	let contacto_compuesto = $derived(lista || []);

	function openNewPerson() {
		showPersonForm = true;
		resetPersonForm();
	}

	function editPersona(i: number) {
		const persona = lista[i];
		if (!persona) return;

		showPersonForm = true;
		editPersonIndex = i;
		contact_name = persona.nombre;
		contact_position = persona.puesto || '';
		contactos = [...persona.contactos];
	}

	function confirmRemovePersona(i: number) {
		if (!confirm('¿Eliminar persona y sus contactos?')) return;

		lista = lista.filter((_, index) => index !== i);
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

		const contacto = { type: contact_type, value: contact_value };

		if (editIndex !== null) {
			contactos = contactos.map((item, i) => (i === editIndex ? contacto : item));
		} else {
			contactos = [...contactos, contacto];
		}

		resetForm();
	}

	function editContacto(i: number) {
		const contacto = contactos[i];
		if (!contacto) return;

		contact_type = contacto.type;
		contact_value = contacto.value;
		editIndex = i;
	}

	function confirmRemoveContacto(i: number) {
		if (!confirm('¿Eliminar contacto?')) return;

		contactos = contactos.filter((_, index) => index !== i);

		if (editIndex === i) resetForm();
		else if (editIndex !== null && editIndex > i) editIndex--;
	}

	function submitPersonaLocal() {
		if (!contact_name.trim()) return;

		const persona = {
			nombre: contact_name.trim(),
			puesto: contact_position.trim(),
			contactos: [...contactos]
		};

		if (editPersonIndex !== null) {
			lista = lista.map((item, i) => (i === editPersonIndex ? persona : item));
		} else {
			lista = [...lista, persona];
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
	<input type="hidden" name="id_cliente" value={id} />
	<input type="hidden" name="contactos" value={JSON.stringify(contacto_compuesto)} />

	{#if id_agente}
		<input type="hidden" name="id_agente" value={id_agente} />
	{/if}

	<section>
		<div class="header">
			<h3 class="label">Contactos:</h3>
		</div>

		<div class="block">
			<div class="acciones">
				{#if isEditing}
					<button class="jelly rojo accion" type="button" onclick={() => (isEditing = !isEditing)}
						>✕</button
					>
				{/if}
				<div class="contact-list">
					{#if lista.length > 0}
						{#each lista as persona, i}
							<!-- svelte-ignore a11y_no_static_element_interactions -->
							<div
								class="person-card honey"
								class:editable={!isEditing}
								ondblclick={() => (isEditing = true)}
								title={!isEditing ? 'Doble clic para editar' : undefined}
							>
								<div class="contact-row">
									{#if isEditing}
										<div class="row-actions">
											<button
												type="button"
												class="btn-edit-small"
												onclick={() => editPersona(i)}
												aria-label="Editar persona">✏️</button
											>
											<button
												type="button"
												class="btn-del-small"
												onclick={() => confirmRemovePersona(i)}
												aria-label="Eliminar persona">🗑️</button
											>
										</div>
									{/if}

									<strong>{persona.nombre}</strong>

									{#if persona.puesto}
										<span class="puesto-badge">{persona.puesto}</span>
									{/if}
								</div>

								{#each persona.contactos as contacto}
									<div>{contacto.type}: {contacto.value}</div>
								{/each}
							</div>
						{/each}
						{#if isEditing}
							<button type="button" class="butter accion" onclick={openNewPerson}>
								Nueva persona
							</button>
						{/if}
					{:else}
						<p>No hay contactos registrados</p>
					{/if}
				</div>

				{#if isEditing}
					{#if showPersonForm}
						<div class="form-persona butter">
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
									<span>Dato de contacto</span>
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
									<button type="button" class="butter" onclick={resetForm}>
										Cancelar edición
									</button>
								{/if}
							</div>

							<div class="contact-list">
								{#each contactos as contacto, i}
									<div class="contact-row">
										<button
											type="button"
											class="btn-edit-small"
											onclick={() => editContacto(i)}
											aria-label="Editar contacto">✏️</button
										>
										<button
											type="button"
											class="btn-del-small"
											onclick={() => confirmRemoveContacto(i)}
											aria-label="Eliminar contacto">🗑️</button
										>
										<p>{contacto.type}: {contacto.value}</p>
									</div>
								{/each}
							</div>

							<div class="form-actions">
								<button
									type="button"
									class="butter"
									onclick={() => {
										showPersonForm = false;
										resetPersonForm();
									}}>Cancelar</button
								>
								<button type="button" class="butter" onclick={submitPersonaLocal}>
									{editPersonIndex !== null ? 'Actualizar persona' : 'Agregar persona'}
								</button>
							</div>
						</div>
					{:else}
						<button type="submit" class="butter accion">Guardar</button>
					{/if}
				{/if}
			</div>
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
		display: flex;
		flex-direction: column;
		gap: var(--a);
		width: 100%;
		padding: var(--a);
	}

	.person-card {
		display: flex;
		flex-direction: column;
		gap: var(--a);
		padding: var(--a);
	}

	.contact-row {
		display: flex;
		align-items: center;
		gap: var(--a);
	}

	.new-contact {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-end;
		gap: var(--a);
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
		justify-content: space-between;
		gap: var(--a);
		margin-top: var(--a);
	}

	.puesto-badge {
		color: #555;
		font-style: italic;
	}

	.btn-edit-small,
	.btn-del-small {
		padding: 4px;
		border: none;
		background: none;
		cursor: pointer;
		font-size: 18px;
		opacity: 0.7;
	}

	.btn-edit-small:hover,
	.btn-del-small:hover {
		opacity: 1;
	}

	.editable {
		cursor: pointer;
	}

	.editable:hover {
		background: rgba(255, 255, 255, 0.08);
	}
	.acciones {
		display: flex;
		gap: var(--a);
	}
</style>
