<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import FormularioProductoNuevo from '$lib/components/Formularios/FormularioProductoNuevo.svelte';
	import { appState } from '$lib/stores/appState.svelte';

	let productoNuevo = $state<Record<string, any>>({});
	let canSubmit = $state(false);
	let tipoId = $state(0);

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
							await update({ reset: true });
							// cerrar modal
						}
					};
				}}
			>
				<input type="hidden" name="caracteristicas" value={JSON.stringify(productoNuevo)} />
				<input type="hidden" name="codigo" value="LOGICA_DEL_CODIGO" />
				<input type="hidden" name="id_tipo_producto" value={tipoId} />

				<FormularioProductoNuevo bind:productoNuevo bind:canSubmit bind:tipoId />
				
				<div class="acciones">
					<button class="butter success" type="submit" disabled={!canSubmit}>Agregar</button>
				</div>
			</form>
		</div>
	</div>
{/if}
