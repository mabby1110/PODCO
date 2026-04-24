<script lang="ts">
	import { enhance } from '$app/forms';
	import { appState } from '$lib/stores/appState.svelte';
	import { addMinutes } from '$lib/utils/agenda';
	import FormSelectInput from '$lib/components/FormSelectMotivo.svelte';
	import FormOptionalInput from '$lib/components/FormOptionalInput.svelte';
	import FormInput from '$lib/components/FormInput.svelte';
	import { motivosActividades } from '$lib';
	import FormSelectAgente from '../FormSelectAgente.svelte';
	import DatePicker from '../DatePicker.svelte';
	import { page } from '$app/state';

	let data = $derived(page.data);

	let objetivo = $state('');
	let duracion = $state(10);
	let observaciones = $state('');
	let requisitos = $state('');
	let inicio = $state('');
	let fin = $state('');
	let agenteSeleccionado = $state<string>('');
</script>

{#if $appState.ModalActivity}
	<div
		class="overlay"
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
				action="/actividades?/addActivity"
				use:enhance={() => {
					appState.toggleModalActivity();
					alert('creado con exito!');
				}}
			>
				<!-- si es admin queda el input oculto -->
				<FormSelectAgente agentes={data.agentes} bind:selected={agenteSeleccionado} />

				<FormSelectInput list={motivosActividades} disableCustom />

				<div class="optional">
					<FormInput
						label="Objetivo"
						name="objetivo"
						bind:value={objetivo}
						placeholder="Define objetivos clave para crear una Oportunidad de venta y/o completar la actividad"
						type="textarea"
						required
					/>
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
				</div>

				<DatePicker />

				<input type="hidden" name="inicio" bind:value={inicio} />
				<input type="hidden" name="fin" bind:value={fin} />
				<input type="hidden" name="fase" value={1} />

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
		gap: var(--b);
	}

	input {
		padding: 0.5rem;
		border: 1px solid #d1d5db;
		border-radius: 4px;
	}

	.datetime-split {
		display: flex;
		gap: var(--a);
	}
	.datetime-item {
		display: flex;
		flex-direction: column;
		width: fit-content;
	}
	.actions {
		display: flex;
		gap: var(--a);
		justify-content: flex-end;
		padding-top: 1rem;
		border-top: 1px solid #e5e5e5;
	}
</style>
