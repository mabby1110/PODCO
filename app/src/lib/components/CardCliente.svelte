<script lang="ts">
	import { slide } from 'svelte/transition';
	import { selectedClient } from '$lib/stores/selectedClient';
	function closeCard(e: MouseEvent) {
		e.stopPropagation();
		selectedClient.clear();
	}
</script>

{#if $selectedClient}
	<div class="card-d" transition:slide>
		<header>
			<button class="close-btn" onclick={closeCard} aria-label="Cerrar">✕</button>
			<h1>{$selectedClient.razon_social}</h1>
			<div class="meta">
				<p>
					<span style="color:{$selectedClient.id_contpaqi ? 'green' : 'red'}">
						{$selectedClient.id_contpaqi ? 'sincronizado' : 'sin sincronizar'}
					</span> con contpaqi
				</p>
				<p>Tipo de prospeccion: <strong>{$selectedClient.tipo_prospeccion??'Lista base en Contpaqi'}</strong></p>
			</div>
		</header>
	</div>
{/if}

<style>
	.card-d {
		display: flex;
		flex-direction: column;
		gap: var(--a);
		border-radius: 12px;
		border: 1px solid var(--color-secondary);
		width: 100%;
		overflow: hidden;
	}
	header {
		display: flex;
		gap: var(--a);
		position: relative;
		flex-direction: column;
		justify-content: space-between;
		align-items: flex-start;
		background-color: var(--color-primary);
		backdrop-filter: blur(16px);
		padding: var(--a);

		position: sticky;
		top: 0;
		z-index: 99;
	}
	header h3 {
		margin-bottom: var(--b);
	}
	header h1 {
		width: 100%;
	}
	.close-btn {
		position: absolute;
		right: var(--a);
		background: transparent;
		border: none;
		line-height: 1;
		padding: 0;
		cursor: pointer;
		opacity: 0.6;
		transition: opacity 0.2s;
		flex-shrink: 0;
	}
	.grid {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: var(--b);
		overflow: auto;
	}
	.grid .date {
		position: absolute;
		right: var(--a);
		top: 0;
		font-size: 0.85em;
	}
	.meta {
		display: flex;
		gap: var(--a);
	}
</style>
