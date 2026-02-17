<script lang="ts">
	import { page } from '$app/state';
	import { slide } from 'svelte/transition';
	import { selectedClient } from '$lib/stores/selectedClient';
	import EditableField from './EditableField.svelte'; // ajusta la ruta según tu estructura
	import FormEditableJsonList from './FormEditableJsonList.svelte';

	const { agentes } = $derived(page.data);

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
					label="Agente"
					name="id_agente"
					type="select"
					bind:value={$selectedClient.id_agente}
					id={$selectedClient.id}
					action="?/updateClient"
					options={agentes}
				/>

				<FormEditableJsonList
					label="Contactos"
					name="contactos"
					bind:jsonList={$selectedClient.contactos}
					id={$selectedClient.id}
					action="?/updateClient"
				/>
			</section>
			<section class="system-section">
				<div class="detail-block">
					<span class="label">Tipo de Prospección:</span>
					<p class="value">{$selectedClient.tipo_prospeccion || 'Cartera de clientes original'}</p>
				</div>
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
	.meta {
		display: flex;
		gap: var(--a);
		flex-wrap: wrap;
		font-size: 14px;
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
		gap: var(--d);
		padding: var(--b) var(--a);
		background: rgba(255, 255, 255, 0.05);
		border-radius: 8px;
	}

	.detail-block {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}
	.system-section {
		display: flex;
		gap: var(--b);
		flex-direction: row;
		flex-wrap: wrap;
		border-top: 1px solid var(--color-secondary);
		padding: var(--a);
	}
	.close-btn {
		position: absolute;
	}
</style>
