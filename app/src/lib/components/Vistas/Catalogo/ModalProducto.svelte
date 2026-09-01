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
		class="overlay"
		role="button"
		tabindex="0"
		onkeydown={(e) => e.key === 'Escape' && closeAndClear()}
	>
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<div class="modal" onclick={(e) => e.stopPropagation()} role="dialog" tabindex="-1">
			<div class="modal-header">
				<h2>Nuevo Producto</h2>
				<button class="close" onclick={closeAndClear}>✕</button>
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

				<button class="butter matcha" type="submit" disabled={!canSubmit}>Agregar</button>
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

	.actions {
		display: flex;
		gap: 0.5rem;
		justify-content: flex-end;
		padding-top: 1rem;
		border-top: 1px solid #e5e5e5;
	}
	.butter:hover:not(:disabled) {
		transform: translateY(-2px);
	}
	.butter:active:not(:disabled) {
		transform: translateY(0);
	}
	.butter:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
</style>
