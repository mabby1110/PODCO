<script lang="ts">
	type ContactItem = {
		type: string;
		value: string;
	};

	type ContactData = {
		nombre: string;
		contactos: ContactItem[];
	};

	let contact_name = $state('');
	let contact_type = $state('telefono');
	let contact_value = $state('');
	let contactos = $state<ContactItem[]>([]);

	// Array para que FormEditableJsonList pueda leerlo directamente
	let contacto_compuesto = $derived(
		JSON.stringify([{ nombre: contact_name, contactos }] satisfies ContactData[])
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

<label>
	<span>Primer contacto</span>
	<input bind:value={contact_name} required placeholder="Nombre completo" />
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
	<button class="butter" type="button" onclick={addContacto}>Agregar</button>
</div>

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
		align-items: end;
	}
	.contact-row label {
		flex-grow: 1;
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