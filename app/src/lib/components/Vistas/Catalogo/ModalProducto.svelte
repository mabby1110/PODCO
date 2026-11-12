<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import FormInput from '$lib/components/Formularios/FormInput.svelte';
	import FormularioProductoNuevo from '$lib/components/Formularios/FormularioProductoNuevo.svelte';
	import { appState } from '$lib/stores/appState.svelte';
	import { profile } from '$lib/stores/profileStore.svelte';

	let productoNuevo = $state<Record<string, any>>({});
	let canSubmit = $state(false);
	let tipoId = $state('');

	function closeAndClear() {
		appState.toggleModalProducto();
	}
</script>

{#if $appState.ModalProducto}
	<div
		class="overlay honey"
		role="button"
		tabindex="0"
		onkeydown={(e) => e.key === 'Escape' && closeAndClear()}
	>
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<div class="modal" onclick={(e) => e.stopPropagation()} role="dialog" tabindex="-1">
			<div class="modal-header">
				<h2>Nuevo Producto</h2>
				<button class="jelly rojo accion" onclick={closeAndClear}>✕</button>
			</div>
			<form
				method="POST"
				action="/catalogo?/nuevoProducto"
				use:enhance={() => {
					return async ({ result, update }) => {
						if (result.type === 'success') {
							invalidateAll();
							appState.toggleModalProducto();
							await update({ reset: true });
							// cerrar modal
						}
					};
				}}
			>
				<input type="hidden" name="caracteristicas" value={JSON.stringify(productoNuevo)} />
				<input type="hidden" name="creado_por" value={$profile?.id} />

				<div class="contenido-formulario">
					<FormularioProductoNuevo bind:productoNuevo bind:canSubmit bind:tipoId />
					<FormInput
						name="codigo"
						label="codigo"
						placeholder="Descripción resumida y publica del producto"
						type="text"
						required
					/>
					<FormInput
						name="descripcion"
						label="descripcion"
						placeholder="Descripción resumida y publica del producto"
						type="text"
						required
					/>
				</div>

				<div class="acciones">
					<button class="butter success" type="submit">Agregar</button>
				</div>
			</form>
		</div>
	</div>
{/if}
