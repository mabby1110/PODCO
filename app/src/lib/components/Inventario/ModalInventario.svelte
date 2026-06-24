<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import { categoriasInventario } from '$lib';
	import { appState } from '$lib/stores/appState.svelte';
	import Searchbar from '../App/Searchbar.svelte';
	import FormInventario from './FormInventario.svelte';

	let data = $derived(page.data);

	let inventario = $derived(data.inventario ?? []);
	
	let lenght = $state(0);
	let unique = $state(false);
	let canSubmit = $state(false);
</script>

{#if $appState.ModalInventario}
	<div
		class="overlay"
		role="button"
		tabindex="0"
		onkeydown={(e) => e.key === 'Escape' && appState.toggleModalInventario()}
	>
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<div class="modal" onclick={(e) => e.stopPropagation()} role="dialog" tabindex="-1">
			<div class="modal-header">
				<h2>Nuevo producto</h2>
				<button class="close" onclick={() => appState.toggleModalInventario()}>✕</button>
			</div>
			<form
				method="POST"
				action="/oportunidades?/add"
				use:enhance={() => {
					return async ({ result, update }) => {
						if (result.type === 'success' && result.data?.op) {
							// Emitimos un evento global
							window.dispatchEvent(
								new CustomEvent('modalOpSuccess', {
									detail: { id_op: result.data.op }
								})
							);

							appState.toggleModalInventario();
							await update({ reset: true });
						}
					};
				}}
			>
				<Searchbar
					label="Buscar existencia por serie, codigo o descripcion"
					data={inventario}
					keyColumns={['serie', 'codigo', 'descripcion']}
					bind:lenght
					bind:unique
				/>
				{#if lenght == 0 && unique}
					<FormInventario bind:isValid={canSubmit} />
				{/if}

				<div class="actions">
					<button class="butter success" type="submit" disabled={!canSubmit}>Agregar</button>
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
