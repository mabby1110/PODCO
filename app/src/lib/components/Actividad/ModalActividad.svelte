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

	let objetivo = $state('');
	let observaciones = $state('');
	let requisitos = $state('');
	let agenteSeleccionado = $state<string>('');
</script>

{#if $appState.ModalActivity}
	<div
		class="overlay"
		role="button"
		tabindex="0"
		onkeydown={(e) => e.key === 'Escape' && appState.toggleModalActivity()}
	>
		<div class="modal" role="dialog" tabindex="-1">
			<div class="modal-header">
				<h2>Nueva Actividad</h2>
				<button class="close" onclick={() => appState.toggleModalActivity()}>✕</button>
			</div>
			<form
				method="POST"
				action="/actividades?/add"
				use:enhance={() => {
					appState.toggleModalActivity();
				}}
			>
				<!-- si es admin queda el input oculto -->
				<FormSelectAgente bind:selected={agenteSeleccionado} />

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

	.close {
		background: none;
		border: none;
		cursor: pointer;
		width: 2rem;
		height: 2rem;
		border-radius: 4px;
	}

	input {
		padding: 0.5rem;
		border: 1px solid #d1d5db;
		border-radius: 4px;
	}
	.actions {
		display: flex;
		gap: var(--a);
		justify-content: flex-end;
		padding-top: 1rem;
		border-top: 1px solid #e5e5e5;
	}
</style>
