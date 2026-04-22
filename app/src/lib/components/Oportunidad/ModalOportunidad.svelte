<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { appState } from '$lib/stores/appState.svelte';
	import FormOportunidad from './FormOportunidad.svelte';
	
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
				action="/oportunidades?/addOp"
				use:enhance={() => {
					appState.toggleModalOp();
					return async ({ result, update }) => {
						if (result.type === 'success' && result.data?.op) {
							const id = result.data.op;
							invalidateAll();
							await update({ reset: true });
						}
					};
				}}
			>
				<FormOportunidad />

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

	.modal {
		background: white;
		border-radius: 8px;
		max-width: 600px;
		max-height: 80vh;
		width: 100%;
		display: flex;
		flex-direction: column;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
		position: relative;
		z-index: 10000;
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1.5rem;
		border-bottom: 1px solid #e5e5e5;
	}

	.close {
		background: none;
		border: none;
		cursor: pointer;
		width: 2rem;
		height: 2rem;
		border-radius: 4px;
	}

	form {
		padding: 1.5rem;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.actions {
		display: flex;
		gap: 0.5rem;
		justify-content: flex-end;
		padding-top: 1rem;
		border-top: 1px solid #e5e5e5;
	}
</style>
