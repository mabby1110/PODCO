<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { appState } from '$lib/stores/appState.svelte';
	import { opModalStore } from '$lib/stores/opModalStore.svelte';
	import FormOportunidad from './FormOportunidad.svelte';

	let canSubmit = $state(false);
</script>

{#if $appState.ModalOp}
	<div
		class="overlay"
		role="button"
		tabindex="0"
		onkeydown={(e) => e.key === 'Escape' && appState.toggleModalOp()}
	>
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<div class="modal" onclick={(e) => e.stopPropagation()} role="dialog" tabindex="-1">
			<div class="modal-header">
				<h2>Nueva Oportunidad</h2>
				<button class="close" onclick={() => appState.toggleModalOp()}>✕</button>
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

							appState.toggleModalOp();
							opModalStore.clearStore();
							invalidateAll();
							await update({ reset: true });
						}
					};
				}}
			>
				<FormOportunidad bind:isValid={canSubmit} />

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
