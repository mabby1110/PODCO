<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { appState } from '$lib/stores/appState.svelte';
	import { opModalStore } from '$lib/stores/opModalStore.svelte';
	import FormCrearTipo from './FormCrearTipo.svelte';

	let canSubmit = $state(false);
	let enviando = $state(false);
	let mensaje = $state<string | null>(null);
	let resetKey = $state(0);

	function closeAndClear() {
		appState.toggleModalTipoProducto();
		opModalStore.clearStore();
		mensaje = null;
		resetKey++; // el formulario se recrea limpio la próxima vez
	}
</script>

{#if $appState.ModalTipoProducto}
	<div
		class="overlay honey"
		role="button"
		tabindex="0"
		onkeydown={(e) => e.key === 'Escape' && closeAndClear()}
	>
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<div class="modal" onclick={(e) => e.stopPropagation()} role="dialog" tabindex="-1">
			<div class="modal-header">
				<h1>Nuevo Tipo de Producto</h1>
				<button class="jelly rojo" type="button" onclick={closeAndClear}>✕</button>
			</div>

			<form
				method="POST"
				action="/catalogo?/crearTipo"
				use:enhance={() => {
					enviando = true;
					mensaje = null;
					return async ({ result, update }) => {
						enviando = false;
						if (result.type === 'success') {
							if (opModalStore.onSuccess) opModalStore.onSuccess(result.data);
							closeAndClear();
							await invalidateAll();
						} else if (result.type === 'failure') {
							mensaje = (result.data?.message as string) ?? 'Error al crear el tipo';
						} else {
							mensaje = 'Error inesperado';
						}
						await update({ reset: false });
					};
				}}
			>
				{#key resetKey}
					<FormCrearTipo bind:canSubmit />
				{/key}

				{#if mensaje}
					<p>{mensaje}</p>
				{/if}

				<div class="acciones">
					<button class="butter success" type="submit" disabled={!canSubmit || enviando}>
						{enviando ? 'Creando...' : 'Agregar'}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}