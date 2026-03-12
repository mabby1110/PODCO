<script lang="ts">
	import { enhance } from '$app/forms';
	import { appState } from '$lib/stores/appState.svelte';
	import { addMinutes } from '$lib/utils/agenda';
	import FormSelectInput from '$lib/components/FormSelectMotivo.svelte';
	import FormOptionalInput from '$lib/components/FormOptionalInput.svelte';
	import FormInput from '$lib/components/FormInput.svelte';
	import { motivosActividades } from '$lib';
	import FormSelectAgente from '../FormSelectAgente.svelte';

	let { data } = $props();

	let objetivo = $state('');
	let observaciones = $state('');
	let requisitos = $state('');
	let fecha = $state('');
	let hora = $state('08:00');
	let inicio = $state('');
	let fin = $state('');
	let agenteSeleccionado = $state<string>('');
	function setCustomEnd(fechaCompromiso: Date) {
		const next = addMinutes(new Date(fechaCompromiso), 10);
		const yyyy = next.getFullYear();
		const mm = String(next.getMonth() + 1).padStart(2, '0');
		const dd = String(next.getDate()).padStart(2, '0');
		const hh = String(next.getHours()).padStart(2, '0');
		const mi = String(next.getMinutes()).padStart(2, '0');

		return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
	};
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
	};
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

{#if $appState.ModalActivity}
	<div
		class="overlay"
		onclick={() => appState.toggleModalActivity()}
		role="button"
		tabindex="0"
		onkeydown={(e) => e.key === 'Escape' && appState.toggleModalActivity()}
	>
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<div class="modal" onclick={(e) => e.stopPropagation()} role="dialog" tabindex="-1">
			<div class="modal-header">
				<h2>Nueva Actividad</h2>
				<button class="close" onclick={() => appState.toggleModalActivity()}>✕</button>
			</div>
			<form
				method="POST"
				action="?/addActivity"
				use:enhance={() => {
					appState.toggleModalActivity();
					alert('creado con exito!');
				}}
			>
				<FormSelectAgente agentes={data.agentes} bind:selected={agenteSeleccionado} />
				<FormSelectInput list={motivosActividades} disableCustom/>
				<div class="optional">
					<FormOptionalInput title="+Objetivo">
						<FormInput
							label="Objetivo"
							name="objetivo"
							bind:value={objetivo}
							placeholder="Define objetivos clave para crear una Oportunidad de venta y/o completar la actividad"
							type="textarea"
							required
						/>
					</FormOptionalInput>
					<FormOptionalInput title="+Observaciones">
						<FormInput
							label="Observaciones"
							name="observaciones"
							bind:value={observaciones}
							placeholder="Detalles importantes y pautas a seguir"
							type="textarea"
							required
						/>
					</FormOptionalInput>
					<FormOptionalInput title="+Requisitos">
						<FormInput
							label="Requisitos"
							name="requisitos"
							bind:value={requisitos}
							placeholder="Viáticos, hospedaje, transporte, permisos de acceso, equipo de seguridad, herramientas especiales u otros requerimientos operativos"
							type="textarea"
							required
						/>
					</FormOptionalInput>
				</div>

				<label>
					<span>Inicio de actividad</span>
					<div class="datetime-split">
						<!-- <input type="date" bind:value={fecha} min={getToday()} required /> -->
						<input type="date" bind:value={fecha} required />

						<select bind:value={hora} required>
							{#each generarHoras() as h}
								<option value={h}>{h}</option>
							{/each}
						</select>
					</div>

					<input type="hidden" name="fase" value={1} />
					<input type="hidden" name="inicio" bind:value={inicio} />
					<input type="hidden" name="fin" bind:value={fin} />
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
		max-height: 80vh;
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

	input {
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
</style>
