<script lang="ts">
	type ContactItem = {
		type: string;
		value: string;
	};

	type ContactData = {
		nombre: string;
		puesto: string;
		contactos: ContactItem[];
	};

	let contact_name = $state('');
	let contact_position = $state('');
	let contact_type = $state('telefono');
	let contact_value = $state('');
	let contactos = $state<ContactItem[]>([]);

	// Array para que FormEditableJsonList pueda leerlo directamente
	let contacto_compuesto = $derived(
		JSON.stringify([
			{ nombre: contact_name, puesto: contact_position, contactos }
		] satisfies ContactData[])
	);

	function addContacto() {
		if (!contact_type || !contact_value) return;
		contactos = [...contactos, { type: contact_type, value: contact_value }];
		contact_value = '';
	}

	function removeContacto(index: number) {
		contactos = contactos.filter((_, i) => i !== index);
	}
</script>

<input type="hidden" name="contactos" value={contacto_compuesto} required />

<div class="contact-row">
	<label class="nombre">
		<h3>Primer contacto</h3>
		<input bind:value={contact_name} required placeholder="Nombre completo" />
	</label>
	<input bind:value={contact_position} placeholder="Puesto" />
	<select bind:value={contact_type}>
		<option value="telefono">Teléfono</option>
		<option value="whatsapp">WhatsApp</option>
		<option value="email">Correo</option>
		<option value="linkedin">LinkedIn</option>
		<option value="otro">Otro</option>
	</select>
	<input bind:value={contact_value} placeholder="3322558174, correo@empresa.com" />
</div>
<button class="butter accion" type="button" onclick={addContacto}>Agregar Contacto</button>

{#if contactos.length}
	<div class="contact-list">
		{#each contactos as c, i}
			<div class="contact-item">
				<button class="close" type="button" onclick={() => removeContacto(i)}>✕</button>
				<strong>{c.type}:</strong>
				{c.value}
			</div>
		{/each}
	</div>
{/if}

<style>
	.contact-row {
		display: flex;
		flex-wrap: wrap;
		gap: var(--a);
	}
	.contact-row .nombre {
		width: 100%;
	}
	.contact-list {
		display: flex;
		flex-direction: column;
		gap: var(--a);
		align-items: baseline;
	}
	.close {
		background: none;
		border: none;
		cursor: pointer;
		width: 2rem;
		height: 2rem;
		border-radius: 4px;
		background-color: var(--color-error);
	}
	.close:hover {
		background-color: var(--color-primary);
	}
</style>
