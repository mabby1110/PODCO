<script lang="ts">
	import { enhance } from '$app/forms';
	import FormNewClient from './FormNewClient.svelte';
	import { invalidateAll } from '$app/navigation';
	import FormSelectAgente from '$lib/components/Formularios/FormSelectAgente.svelte';
	import { StoreAplicacion } from '$lib/stores/app/StoreAplicacion.svelte';
	let isDuplicate = $state(false);

</script>

{#if StoreAplicacion.value.modal_nuevo_cliente}
	<div
		class="overlay honey"
		role="button"
		tabindex="0"
		onkeydown={(e) => e.key === 'Escape' && StoreAplicacion.toggle("modal_nuevo_cliente")}
	>
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<div class="modal" onclick={(e) => e.stopPropagation()} role="dialog" tabindex="-1">
			<div class="modal-header">
				<h2>Nuevo Cliente</h2>
				<button class="jelly rojo accion" onclick={() => StoreAplicacion.set("modal_nuevo_cliente", false)}>✕</button>
			</div>
			<form
				method="POST"
				action="?/add"
				use:enhance={() => {
					StoreAplicacion.set("modal_nuevo_cliente", false);
					invalidateAll();
					alert('creado con exito!');
				}}
			>
				<div class="form-content">
					<FormSelectAgente />
					<FormNewClient bind:isDuplicate />
				</div>

				<div class="actions">
					<button
						class="butter {isDuplicate ? 'disabled' : 'success'}"
						type="submit"
						disabled={isDuplicate}>Agregar</button
					>
				</div>
			</form>
		</div>
	</div>
{/if}
