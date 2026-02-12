<script lang="ts">
	import { slide } from 'svelte/transition';
	import { selectedClient } from '$lib/stores/selectedClient';
	import EditableField from './EditableField.svelte'; // ajusta la ruta según tu estructura

	let { agentes } = $props();

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
						{$selectedClient.id_contpaqi ? 'Sincronizado' : 'Sin sincronizar'}
					</span> con Contpaqi
				</p>
				<p>ID: <strong>{$selectedClient.id}</strong></p>
			</div>
		</header>

		<div class="content">
			<section class="info-section">
				<h3>Información General</h3>

				<EditableField
					label="Razón Social"
					name="razon_social"
					bind:value={$selectedClient.razon_social}
					id={$selectedClient.id}
					action="?/updateClient"
					placeholder="Nombre de la empresa"
				/>

				<EditableField
					label="Ubicación"
					name="ubicacion"
					type="textarea"
					rows={2}
					bind:value={$selectedClient.ubicacion}
					id={$selectedClient.id}
					action="?/updateClient"
					placeholder="Dirección completa"
				/>

				<EditableField
					label="Tipo de Prospección"
					name="tipo_prospeccion"
					bind:value={$selectedClient.tipo_prospeccion}
					id={$selectedClient.id}
					action="?/updateClient"
					placeholder="Lista base en Contpaqi"
				/>

				<!-- Campo Agente con Select -->
				<div class="detail-block">
					<form method="POST" action="?/updateClient">
						<input type="hidden" name="id" value={$selectedClient.id} />

						<label for="agente-select">
							<span class="label">Agente:</span>
						</label>

						<EditableField
							label="Agente"
							name="id_agente"
							type="select"
							bind:value={$selectedClient.id_agente}
							id={$selectedClient.id}
							action="?/updateClient"
							options={agentes}
						/>
					</form>
				</div>
			</section>

			<section class="info-section">
				<h3>Datos del Sistema</h3>

				<div class="detail-block">
					<span class="label">Fecha de creación:</span>
					<p class="value">
						{$selectedClient.fecha_creacion
							? new Date($selectedClient.fecha_creacion).toLocaleDateString('es-MX', {
									year: 'numeric',
									month: 'long',
									day: 'numeric'
								})
							: 'N/A'}
					</p>
				</div>

				<div class="detail-block">
					<span class="label">Última actualización:</span>
					<p class="value">
						{$selectedClient.ultima_actualizacion
							? new Date($selectedClient.ultima_actualizacion).toLocaleDateString('es-MX', {
									year: 'numeric',
									month: 'long',
									day: 'numeric',
									hour: '2-digit',
									minute: '2-digit'
								})
							: 'N/A'}
					</p>
				</div>

				{#if $selectedClient.fecha_sync}
					<div class="detail-block">
						<span class="label">Última sincronización:</span>
						<p class="value">
							{new Date($selectedClient.fecha_sync).toLocaleDateString('es-MX', {
								year: 'numeric',
								month: 'long',
								day: 'numeric',
								hour: '2-digit',
								minute: '2-digit'
							})}
						</p>
					</div>
				{/if}
			</section>
		</div>
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
		overflow: auto;
		max-height: 90vh;
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

	header h1 {
		width: 100%;
		margin: 0;
	}

	.close-btn {
		position: absolute;
		right: var(--a);
		top: var(--a);
		background: transparent;
		border: none;
		font-size: 24px;
		line-height: 1;
		padding: 0;
		cursor: pointer;
		opacity: 0.6;
		transition: opacity 0.2s;
		flex-shrink: 0;
	}

	.close-btn:hover {
		opacity: 1;
	}

	.meta {
		display: flex;
		gap: var(--a);
		flex-wrap: wrap;
		font-size: 14px;
	}

	.meta p {
		margin: 0;
	}

	.content {
		display: flex;
		flex-direction: column;
		gap: var(--a);
		padding: var(--a);
		overflow-y: auto;
	}

	.info-section {
		display: flex;
		flex-direction: column;
		gap: var(--b, 12px);
		padding: var(--a);
		background: rgba(255, 255, 255, 0.05);
		border-radius: 8px;
	}

	.info-section h3 {
		margin: 0 0 var(--b) 0;
		font-size: 18px;
		color: var(--color-secondary, #fff);
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
		padding-bottom: var(--b);
	}

	.detail-block {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.label {
		font-size: 14px;
		opacity: 0.7;
		margin-bottom: 4px;
	}

	.value {
		margin: 0;
		font-size: 16px;
	}

	select {
		width: 100%;
		padding: 8px;
		border-radius: 4px;
		border: 1px solid rgba(255, 255, 255, 0.3);
		background: rgba(255, 255, 255, 0.1);
		color: inherit;
		font-family: inherit;
		font-size: 14px;
		cursor: pointer;
		transition: all 0.2s;
	}

	select:hover {
		background: rgba(255, 255, 255, 0.15);
		border-color: rgba(255, 255, 255, 0.5);
	}

	select:focus {
		outline: none;
		border-color: var(--color-secondary, #fff);
		background: rgba(255, 255, 255, 0.2);
	}

	form {
		width: 100%;
	}
</style>
