<script lang="ts">
	import { enhance } from '$app/forms';
	import { motivosActividades } from '$lib';
	import DatePicker from '$lib/components/Formularios/DatePicker.svelte';
	import FormInput from '$lib/components/Formularios/FormInput.svelte';
	import FormOptionalInput from '$lib/components/Formularios/FormOptionalInput.svelte';
	import FormSelectAgente from '$lib/components/Formularios/FormSelectAgente.svelte';
	import FormSelectMotivo from '$lib/components/Formularios/FormSelectMotivo.svelte';
	import { appState } from '$lib/stores/appState.svelte';

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

				<FormSelectMotivo list={motivosActividades} disableCustom />

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
