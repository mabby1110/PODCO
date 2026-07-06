<script lang="ts">
	import { page } from '$app/state';
	import { profile } from '$lib/stores/profileStore.svelte';
	import { appState } from '$lib/stores/appState.svelte';
	import EditableSelect from '$lib/components/Cliente/EditableSelect.svelte';
	import FormEditableContact from '$lib/components/Cliente/FormEditableContact.svelte';
	import CardOpListPreview from '$lib/components/Oportunidad/CardOpListPreview.svelte';
	import Card from '$lib/components/Card.svelte';
	import EditableInput from '$lib/components/App/form/EditableInput.svelte';

	let { cliente, oportunidades, agentes } = $derived(page.data);
	let openOp = $derived(oportunidades?.filter((a: any) => a.id_cliente == cliente.id));

	let isEditing = $state(false);
	const formatDate = (date: string | null) => {
		if (!date) return 'N/A';
		return new Date(date).toLocaleDateString('es-MX', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			...(date.includes('T') || date.includes(':') ? { hour: '2-digit', minute: '2-digit' } : {})
		});
	};
</script>

<Card>
	{#snippet header()}
		<a href="/clientes" class="close" aria-label="Cerrar">✕</a>
		<h1>{cliente.razon_social || cliente.nombre_comercial}</h1>
		<div class="meta">
			<p>
				<span style="color:{cliente.id_contpaqi ? 'green' : 'red'}">
					{cliente.id_contpaqi ? 'Sincronizado' : 'Sin sincronizar'}
				</span> con Contpaqi
			</p>
			<p>ID: <strong>{cliente.id}</strong></p>
		</div>
	{/snippet}

	{#snippet content()}
		{#if $profile?.isAdmin}
			<EditableSelect
				{isEditing}
				label="Agente"
				name="id_agente"
				id_cliente={cliente.id}
				value={cliente.id_agente}
				options={agentes}
				action="/clientes?/update"
				hint="Asignar responsable"
			/>
		{:else}
			<section class="detail-block">
				<h3 class="label">Agente:</h3>
				<div class="detail-body">
					<p class="value">{$profile?.nombre}</p>
				</div>
			</section>
		{/if}
		<FormEditableContact
			{isEditing}
			lista={cliente.contactos}
			id={cliente.id}
			id_agente={$profile?.isAdmin ? cliente.id_agente : $profile?.id}
			action="/clientes?/update"
		/>
		<EditableInput
			{isEditing}
			label="Razón Social"
			name="razon_social"
			value={cliente.razon_social}
			id={cliente.id}
			id_agente={$profile?.isAdmin ? cliente.id_agente : $profile?.id}
			action="/clientes?/update"
			placeholder="Razon social"
		/>
		<EditableInput
			{isEditing}
			label="Nombre Comercial"
			name="nombre_comercial"
			value={cliente.nombre_comercial}
			id={cliente.id}
			id_agente={$profile?.isAdmin ? cliente.id_agente : $profile?.id}
			action="/clientes?/update"
			placeholder="Nombre de la empresa"
		/>
		<EditableInput
			{isEditing}
			label="Sector"
			name="sector"
			value={cliente.sector}
			id={cliente.id}
			id_agente={$profile?.isAdmin ? cliente.id_agente : $profile?.id}
			action="/clientes?/update"
			placeholder="Sector económico"
		/>
		<EditableInput
			{isEditing}
			label="Giro comercial"
			name="giro_comercial"
			value={cliente.giro_comercial}
			id={cliente.id}
			id_agente={$profile?.isAdmin ? cliente.id_agente : $profile?.id}
			action="/clientes?/update"
			placeholder="El giro describe el tipo de producto o servicio exacto"
		/>
		<EditableInput
			{isEditing}
			label="Estado"
			name="estado"
			value={cliente.estado}
			id={cliente.id}
			id_agente={$profile?.isAdmin ? cliente.id_agente : $profile?.id}
			action="/clientes?/update"
			placeholder="Estado"
		/>
		<EditableInput
			{isEditing}
			label="Ciudad"
			name="ciudad"
			value={cliente.ciudad}
			id={cliente.id}
			id_agente={$profile?.isAdmin ? cliente.id_agente : $profile?.id}
			action="/clientes?/update"
			placeholder="Ciudad"
		/>
		<EditableInput
			{isEditing}
			label="Ubicación"
			name="ubicacion"
			value={cliente.ubicacion}
			id={cliente.id}
			id_agente={$profile?.isAdmin ? cliente.id_agente : $profile?.id}
			action="/clientes?/update"
			placeholder="Ubicacion en mapa"
		/>
		<EditableInput
			{isEditing}
			label="Código postal"
			name="cp"
			value={cliente.cp}
			id={cliente.id}
			id_agente={$profile?.isAdmin ? cliente.id_agente : $profile?.id}
			action="/clientes?/update"
			placeholder="Código postal"
		/>
		<EditableInput
			{isEditing}
			label="Página web"
			name="pagina_web"
			value={cliente.pagina_web}
			id={cliente.id}
			id_agente={$profile?.isAdmin ? cliente.id_agente : $profile?.id}
			action="/clientes?/update"
			placeholder="www.bmscomponentes.com"
		/>
		<div class="system">
			<div class="detail-block">
				<span class="label">Tipo de Prospección:</span>
				<p class="value">{cliente.tipo_prospeccion || 'Cartera de clientes original'}</p>
			</div>
			<div class="detail-block">
				<span class="label">Fecha de creación:</span>
				<p class="value">{formatDate(cliente.fecha_creacion)}</p>
			</div>
			<div class="detail-block">
				<span class="label">Última actualización:</span>
				<p class="value">{formatDate(cliente.ultima_actualizacion)}</p>
			</div>
			{#if cliente.fecha_sync}
				<div class="detail-block">
					<span class="label">Última sincronización:</span>
					<p class="value">{formatDate(cliente.fecha_sync)}</p>
				</div>
			{/if}
		</div>
	{/snippet}

	{#snippet actions()}
		<div class="submit">
			<button onclick={() => (isEditing = !isEditing)} class="butter {isEditing}">Editar</button>
			<button onclick={() => appState.toggleModalOp()} class="butter">+Oportunidad</button>
		</div>
	{/snippet}
</Card>
<div class="op-list">
	{#if openOp.length > 0}
		{#each openOp as op}
			<CardOpListPreview event={op} />
		{/each}
	{/if}
</div>

<style>
	.true {
		background-color: var(--color-highlight);
	}
	.meta {
		display: flex;
		gap: var(--a);
	}
	.close {
		position: absolute;
		top: 0;
		right: 0;
		padding: 0 var(--a);
		opacity: 0.6;
		text-decoration: none;
		color: inherit;
	}
	.system {
		display: flex;
		gap: var(--b);
		flex-wrap: wrap;
		border-top: 1px solid var(--color-secondary);
		padding: var(--c) var(--a);
		margin-top: var(--c);
	}
	.op-list {
		display: flex;
		flex-direction: column;
		gap: var(--a);
		width: 100%;
		padding: 0 var(--a);
		margin-bottom: var(--e);
	}
</style>
