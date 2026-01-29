<script lang="ts">
	import { enhance } from '$app/forms';
	import { appState } from '$lib/stores/appState.svelte';
	import { addMinutes } from '$lib/utils/agenda';
	import { profile } from '$lib/stores/profileStore.svelte';
	let selectedDataItem = $state(null);

	// --- Pickers separados ---
	let razon_social = $state('');
	let ubicaciones = $state('');
	let contact_name = $state('');
	let contact_type = $state('');
	let contact_value = $state('');
	let contacto_compuesto = $derived(`${contact_name} | ${contact_type}: ${contact_value}`);
	let fecha = $state<string>('');
	let hora = $state<string>('08:00');
	let inicio = $state<string>('');
	let fin = $state<string>('');

	function getToday() {
		const t = new Date();
		return t.toISOString().slice(0, 10);
	}

	function setCustomEnd(fechaCompromiso: Date) {
		const next = addMinutes(new Date(fechaCompromiso), 10);

		const yyyy = next.getFullYear();
		const mm = String(next.getMonth() + 1).padStart(2, '0');
		const dd = String(next.getDate()).padStart(2, '0');
		const hh = String(next.getHours()).padStart(2, '0');
		const mi = String(next.getMinutes()).padStart(2, '0');

		return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
	}

	function generarHoras() {
		const horas = [];
		let actual = 8 * 60; // 08:00
		const limite = 18 * 60; // 18:00

		while (actual <= limite) {
			const hh = String(Math.floor(actual / 60)).padStart(2, '0');
			const mm = String(actual % 60).padStart(2, '0');
			horas.push(`${hh}:${mm}`);
			actual += 10;
		}

		return horas;
	}
	
	$effect(() => console.log(razon_social));
	
	$effect(() => {
		if (fecha && hora) {
			const base = `${fecha} ${hora}`;
			inicio = base;
			fin = setCustomEnd(new Date(`${fecha}T${hora}`));
		} else {
			inicio = '';
			fin = '';
		}
	});
</script>

{#if $appState.ModalClient}
	<div
		class="overlay"
		onclick={() => appState.toggleModalClient()}
		role="button"
		tabindex="0"
		onkeydown={(e) => e.key === 'Escape' && appState.toggleModalClient()}
	>
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<div class="modal" onclick={(e) => e.stopPropagation()} role="dialog" tabindex="-1">
			<div class="modal-header">
				<h2>Nuevo Cliente</h2>
				<button class="close" onclick={() => appState.toggleModalClient()}>✕</button>
			</div>
			<form
				method="POST"
				action="?/addClient"
				use:enhance={() => {
					appState.toggleModalClient();
					selectedDataItem = null;
					alert('creado con exito!');
				}}
			>
				<label>
					<span>Razon social</span>
					<input
						name="razon_social"
						bind:value={razon_social}
						placeholder="BMS Componentes y Equipos Industriales S.A. de C.V."
						required
					/>
				</label>
				
				<label>
					<span>Ubicacion(es)</span>
					<textarea
						name="ubicaciones"
						id="ubicaciones"
						bind:value={ubicaciones}
						required
						rows="2"
						placeholder="copiar y pegar de google maps ej. Antonio Bravo 128, Las Liebres, 45623 San Pedro Tlaquepaque, Jal."
					></textarea>
				</label>

				<label>
					<span>Nombre del contacto</span>
					<input name="contact_name" bind:value={contact_name} required placeholder="Nombre completo" />
				</label>

				<label>
					<span>Tipo de contacto</span>
					<select name="contact_type" bind:value={contact_type} required >
						<option value="telefono">Teléfono</option>
						<option value="whatsapp">WhatsApp</option>
						<option value="email">Correo</option>
						<option value="linkedin">LinkedIn</option>
						<option value="otro">Otro</option>
					</select>
				</label>

				<label>
					<span>Contacto</span>
					<input
						name="contact_value"
						bind:value={contact_value}
						required
						placeholder="3322558174 o correo@empresa.com"
					/>
				</label>

                
				<label>
                    <span>Programar contacto inicial</span>
					<div class="datetime-split">
                        <input type="date" bind:value={fecha} min={getToday()} required />
                        
						<select bind:value={hora} required>
                            {#each generarHoras() as h}
                            <option value={h}>{h}</option>
							{/each}
						</select>
					</div>
                    
                    <input type="hidden" name="contactos" value={contacto_compuesto} />
					<input type="hidden" name="fase" value={1} />
					<input type="hidden" name="inicio" bind:value={inicio} />
					<input type="hidden" name="fin" bind:value={fin} />
					<input type="hidden" name="id_agente" value={$profile?.id} />
				</label>

				<div class="actions">
					<button class="butter success" type="submit">Agregar</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<style>
	.overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.5);
		backdrop-filter: blur(4px);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 9999;
		padding: 1rem;
	}

	.modal {
		background: white;
		border-radius: 8px;
		max-width: 600px;
		max-height: 90vh;
		width: 100%;
		display: flex;
		flex-direction: column;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
		position: relative;
		z-index: 10000;
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1.5rem;
		border-bottom: 1px solid #e5e5e5;
	}

	.close {
		background: none;
		border: none;
		cursor: pointer;
		width: 2rem;
		height: 2rem;
		border-radius: 4px;
	}

	form {
		padding: 1.5rem;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	label {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	input,
	textarea,
	select {
		padding: 0.5rem;
		border: 1px solid #d1d5db;
		border-radius: 4px;
	}

	.datetime-split {
		display: flex;
		gap: 0.5rem;
	}

	.actions {
		display: flex;
		gap: 0.5rem;
		justify-content: flex-end;
		padding-top: 1rem;
		border-top: 1px solid #e5e5e5;
	}

	.selected-client {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
</style>