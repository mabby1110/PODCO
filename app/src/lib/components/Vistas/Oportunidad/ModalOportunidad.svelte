<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { appState } from '$lib/stores/appState.svelte';
	import { StoreEntradas } from '$lib/stores/StoreEntradas.svelte';
	import { fade } from 'svelte/transition';
	import FormOportunidad from './FormOportunidad.svelte';

	let canSubmit = $state(false);

	function closeAndClear() {
		appState.toggleModalOp();
		StoreEntradas.clearStore();
	}
</script>

{#if $appState.ModalOp}
	<div
		class="overlay honey"
		role="button"
		tabindex="0"
		onkeydown={(e) => e.key === 'Escape' && closeAndClear()}
		in:fade
	>
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<div class="modal" onclick={(e) => e.stopPropagation()} role="dialog" tabindex="-1">
			<div class="modal-header">
				<h1>Nueva Oportunidad</h1>
				<button class="jelly rojo accion" onclick={closeAndClear}>✕</button>
			</div>
			<form
				method="POST"
				action="/oportunidades?/add"
				use:enhance={() => {
					return async ({ result, update }) => {
						if (result.type === 'success' && result.data?.id) {
							StoreEntradas.onSuccess?.(result.data.id);
							closeAndClear();
							invalidateAll();
							await update({ reset: true });
						}
					};
				}}
			>
				{#if StoreEntradas.origen?.tipo === 'actividad'}
					<input type="hidden" name="id_actividad" value={StoreEntradas.origen.id} />
					{StoreEntradas.origen?.tipo} > {StoreEntradas.destino} id: {StoreEntradas.origen?.id}
				{/if}
				
				<FormOportunidad bind:isValid={canSubmit} />

				<div class="acciones">
					<button class="butter success" type="submit" disabled={!canSubmit}>Agregar</button>
				</div>
			</form>
		</div>
	</div>
{/if}
