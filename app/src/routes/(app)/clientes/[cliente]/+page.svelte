<script lang="ts">
	import { page } from '$app/state';
	import { slide } from 'svelte/transition';
	import { profile } from '$lib/stores/profileStore.svelte';
	import EditableField from '$lib/components/EditableField.svelte';
	import EditableSelectField from '$lib/components/EditableSelectField.svelte';
	import FormEditableContact from '$lib/components/Cliente/FormEditableContact.svelte';
	import { appState } from '$lib/stores/appState.svelte';
	import CardOpListPreview from '$lib/components/Oportunidad/CardOpListPreview.svelte';

	let { cliente } = $derived(page.data);
	let { oportunidades } = $derived(page.data);
	let openOp = $derived(oportunidades?.filter((a: any) => a.id_cliente == cliente.id));
	const agentes = $derived(page.data.agentes);
</script>

<div class="card-full" transition:slide>
	<header>
		<a href="/clientes" class="close" aria-label="Cerrar">✕</a>

		<h1>{cliente.razon_social}</h1>

		<div class="meta">
			<p>
				<span style="color:{cliente.id_contpaqi ? 'green' : 'red'}">
					{cliente.id_contpaqi ? 'Sincronizado' : 'Sin sincronizar'}
				</span> con Contpaqi
			</p>
			<p>ID: <strong>{cliente.id}</strong></p>
		</div>
	</header>

	<div class="card-content">
		<EditableField
			label="Razón Social"
			name="razon_social"
			value={cliente.razon_social}
			id={cliente.id}
			action="/clientes?/updateClient"
			placeholder="Nombre de la empresa"
		/>

		<EditableField
			label="Estado"
			name="estado"
			type="text"
			value={cliente.estado}
			id={cliente.id}
			action="/clientes?/updateClient"
			placeholder="Estado de la republica"
		/>
		<EditableField
			label="Ciudad"
			name="ciudad"
			type="text"
			value={cliente.ciudad}
			id={cliente.id}
			action="/clientes?/updateClient"
			placeholder="Ciudad"
		/>
		<EditableField
			label="Sector"
			name="sector"
			type="text"
			value={cliente.sector}
			id={cliente.id}
			action="/clientes?/updateClient"
			placeholder="Sector economico"
		/>

		{#if $profile?.isAdmin}
			<EditableSelectField
				label="Agente"
				name="id_agente"
				id={cliente.id}
				value={cliente.id_agente}
				options={agentes}
				action="/clientes?/updateClient"
				hint="Asignar responsable"
			/>
		{:else}
			<div class="detail-block">
				<h3 class="label">Agente:</h3>
				<div class="detail-body">
					<p class="value">{$profile?.nombre}</p>
				</div>
			</div>
		{/if}

		<FormEditableContact
			jsonList={cliente.contactos}
			id={cliente.id}
			action="/clientes?/updateClient"
		/>

		{#if openOp.length > 0}
			<div class="op-list">
				<div class="controls">
					<button onclick={() => appState.toggleModalOp()} class="butter">+Oportunidad</button>
				</div>
				{#each openOp as op}
					<CardOpListPreview event={op} />
				{/each}
			</div>
		{/if}

		<div class="system">
			<div class="detail-block">
				<span class="label">Tipo de Prospección:</span>
				<p class="value">{cliente.tipo_prospeccion || 'Cartera de clientes original'}</p>
			</div>

			<div class="detail-block">
				<span class="label">Fecha de creación:</span>
				<p class="value">
					{cliente.fecha_creacion
						? new Date(cliente.fecha_creacion).toLocaleDateString('es-MX', {
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
					{cliente.ultima_actualizacion
						? new Date(cliente.ultima_actualizacion).toLocaleDateString('es-MX', {
								year: 'numeric',
								month: 'long',
								day: 'numeric',
								hour: '2-digit',
								minute: '2-digit'
							})
						: 'N/A'}
				</p>
			</div>

			{#if cliente.fecha_sync}
				<div class="detail-block">
					<span class="label">Última sincronización:</span>
					<p class="value">
						{new Date(cliente.fecha_sync).toLocaleDateString('es-MX', {
							year: 'numeric',
							month: 'long',
							day: 'numeric',
							hour: '2-digit',
							minute: '2-digit'
						})}
					</p>
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	.meta {
		display: flex;
		gap: var(--a);
	}
	.close {
		position: absolute;
		top: 0;
		right: 0;
		background: transparent;
		border: none;
		padding: 0 var(--a);
		cursor: pointer;
		opacity: 0.6;
		transition: opacity 0.2s;
		flex-shrink: 0;
		cursor: pointer;
		text-decoration: none;
	}
	.system {
		display: flex;
		gap: var(--b);
		flex-direction: row;
		flex-wrap: wrap;
		border-top: 1px solid var(--color-secondary);
		padding: var(--c) var(--a) var(--f);
		margin-top: var(--c);
	}
	.op-list {
		padding: var(--a);
		border-top: 1px solid var(--color-secondary);
		display: flex;
		flex-direction: column;
		gap: var(--a);
		margin-top: var(--c);
		padding-top: var(--c);
	}
</style>
