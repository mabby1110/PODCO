<script lang="ts">
	import { page } from '$app/state';
	import { profile } from '$lib/stores/profileStore.svelte';
	import { appState } from '$lib/stores/appState.svelte';
	import EditableField from '$lib/components/EditableField.svelte';
	import EditableSelectField from '$lib/components/EditableSelectField.svelte';
	import FormEditableContact from '$lib/components/Cliente/FormEditableContact.svelte';
	import CardOpListPreview from '$lib/components/Oportunidad/CardOpListPreview.svelte';
	import Card from '$lib/components/Card.svelte';

	let { cliente, oportunidades, agentes } = $derived(page.data);
	let openOp = $derived(oportunidades?.filter((a: any) => a.id_cliente == cliente.id));

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
		<h1>{cliente.razon_social}</h1>
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
			<EditableSelectField
				id={cliente.id}
				id_agente={cliente.id_agente}
				{agentes}
				action="/clientes?/update"
			/>
		{:else}
			<section class="detail-block">
				<h3 class="label">Agente:</h3>
				<div class="detail-body">
					<p class="value">{$profile?.nombre}</p>
				</div>
			</section>
		{/if}

		<section>
			<FormEditableContact
				jsonList={cliente.contactos}
				id={cliente.id}
				action="/clientes?/update"
			/>
		</section>
		<div class="card-grid">
			<EditableField
				label="Razón Social"
				name="razon_social"
				value={cliente.razon_social}
				id={cliente.id}
				action="/clientes?/update"
				placeholder="Razon social"
			/>
			<EditableField
				label="Nombre Comercial"
				name="nombre_comercial"
				value={cliente.nombre_comercial}
				id={cliente.id}
				action="/clientes?/update"
				placeholder="Nombre de la empresa"
			/>
			<EditableField
				label="Sector"
				name="sector"
				value={cliente.sector}
				id={cliente.id}
				action="/clientes?/update"
				placeholder="Sector económico"
			/>
			<EditableField
				label="Giro comercial"
				name="descripcion"
				value={cliente.descripcion}
				id={cliente.id}
				action="/clientes?/update"
				placeholder="El giro describe el tipo de producto o servicio exacto"
			/>
			<EditableField
				label="Estado"
				name="estado"
				value={cliente.estado}
				id={cliente.id}
				action="/clientes?/update"
				placeholder="Estado"
			/>
			<EditableField
				label="Ciudad"
				name="ciudad"
				value={cliente.ciudad}
				id={cliente.id}
				action="/clientes?/update"
				placeholder="Ciudad"
			/>
			<EditableField
				label="Ubicación"
				name="ubicacion"
				value={cliente.ubicacion}
				id={cliente.id}
				action="/clientes?/update"
				placeholder="Ubicacion en mapa"
			/>
			<EditableField
				label="Código postal"
				name="cp"
				value={cliente.cp}
				id={cliente.id}
				action="/clientes?/update"
				placeholder="Código postal"
			/>
			<EditableField
				label="Página web"
				name="pagina_web"
				value={cliente.pagina_web}
				id={cliente.id}
				action="/clientes?/update"
				placeholder="www.bmscomponentes.com"
			/>
		</div>

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
			<button onclick={() => appState.toggleModalOp()} class="butter">+Oportunidad</button>
		</div>
		<div class="op-list">
			{#if openOp.length > 0}
				{#each openOp as op}
					<CardOpListPreview event={op} />
				{/each}
			{/if}
		</div>
	{/snippet}
</Card>

<style>
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
	.card-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: var(--c) var(--a);
	}
</style>
