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

	let isEditing = $state(false);
	let lista = $state<ContactData[]>(jsonList && jsonList !== '' ? JSON.parse(jsonList) : []);

	let contact_name = $state('');
	let contact_type = $state('telefono');
	let contact_value = $state('');
	let contactos = $state<ContactItem[]>([]);
	let editIndex = $state<number | null>(null);
	let editPersonIndex = $state<number | null>(null);

	let contacto_compuesto = $derived(JSON.stringify(lista));

	function toggleEdit() {
		isEditing = !isEditing;
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

	function removeContacto(index: number) {
		contactos = contactos.filter((_, i) => i !== index);
		if (editIndex === index) resetForm();
	}

	function submitPersona() {
		if (!contact_name) return;
		const persona = { nombre: contact_name, contactos };
		if (editPersonIndex !== null) {
			lista = lista.map((p, i) => (i === editPersonIndex ? persona : p));
		} else {
			lista = [...lista, persona];
		}
		resetPersonForm();
	}

	function editPersona(i: number) {
		const p = lista[i];
		if (!p) return;
		contact_name = p.nombre;
		contactos = p.contactos;
		editPersonIndex = i;
	}

	function removePersona(index: number) {
		lista = lista.filter((_, i) => i !== index);
		if (editPersonIndex === index) resetPersonForm();
	}

	function handleSubmit() {
		jsonList = contacto_compuesto;
		return async ({ update }: any) => {
			isEditing = false;
			await update();
		};
	}
</script>

<form method="POST" {action} use:enhance={handleSubmit}>
	<input type="hidden" name="id" value={id} />
	<input type="hidden" {name} value={contacto_compuesto} />

	<div class="detail-block">
		<div class="detail-header">
			<h3 class="label">{label}:</h3>
			{#if !isEditing}
				<button type="button" class="btn-edit-small" onclick={toggleEdit}>✏️</button>
			{/if}
		</div>
		<div class="detail-body">
			{#if isEditing}
				{#each lista as persona, i}
					<div class="contact-list">
						<div class="contact-row">
							<strong>{persona.nombre}</strong>
							<button class="butter edit" type="button" onclick={() => editPersona(i)}>✏️</button>
							<button class="close" type="button" onclick={() => removePersona(i)}>🗑️</button>
						</div>
						{#each persona.contactos as c}
							<p>{c.type}: {c.value}</p>
						{/each}
					</div>
				{/each}

				<hr />

				<label>
					<span>{editPersonIndex !== null ? 'Editando persona' : 'Nueva persona'}</span>
					<input bind:value={contact_name} placeholder="Nombre completo" />
				</label>

				<div class="contact-row">
					<label>
						<span>Contacto</span>
						<input bind:value={contact_value} placeholder="3322558174 o correo@empresa.com" />
					</label>
					<label>
						<span>Medio</span>
						<select bind:value={contact_type}>
							<option value="telefono">Teléfono</option>
							<option value="whatsapp">WhatsApp</option>
							<option value="email">Correo</option>
							<option value="linkedin">LinkedIn</option>
							<option value="otro">Otro</option>
						</select>
					</label>
					<button class="butter" type="button" onclick={submitContacto}>
						{editIndex !== null ? 'Actualizar' : 'Agregar'}
					</button>
					{#if editIndex !== null}
						<button class="butter" type="button" onclick={resetForm}>Cancelar</button>
					{/if}
				</div>

				<div class="contact-list">
					{#each contactos as contacto, i}
						<div class="contact-row">
							<span>{contacto.type}: {contacto.value}</span>
							<button class="butter edit" type="button" onclick={() => editContacto(i)}>✏️</button>
							<button class="close-btn" type="button" onclick={() => removeContacto(i)}>🗑️</button>
						</div>
					{/each}
				</div>

				<button class="butter" type="button" onclick={submitPersona}>
					{editPersonIndex !== null ? 'Actualizar persona' : 'Agregar persona'}
				</button>
				{#if editPersonIndex !== null}
					<button class="butter" type="button" onclick={resetPersonForm}>Cancelar</button>
				{/if}

				<hr />

				<button class="butter" type="button" onclick={toggleEdit}>Cerrar</button>
				<button class="butter" type="submit">Guardar</button>
			{:else if lista.length > 0}
				<div class="contact-list">
					{#each lista as persona}
						<p><strong>{persona.nombre}</strong></p>
						{#each persona.contactos as c}
							<p>{c.type}: {c.value}</p>
						{/each}
					{/each}
				</div>
			{:else}
				<p class="value">Sin información</p>
			{/if}
		</div>
	</div>
</form>

<style>
	.contact-row {
		display: flex;
		flex-wrap: wrap;
		gap: var(--a);
		align-items: end;
	}
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
		padding-left: var(--b);
	}
	.label {
		font-size: 20px;
	}
	.contact-list {
		display: flex;
		flex-direction: column;
		gap: var(--a);
		align-items: baseline;
	}
	.btn-edit-small {
		background: none;
		border: none;
		cursor: pointer;
		font-size: 18px;
		padding: 4px;
		opacity: 0.7;
		transition: opacity 0.2s;
	}
	.btn-edit-small:hover {
		opacity: 1;
	}
</style>
