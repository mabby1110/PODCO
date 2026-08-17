<script lang="ts">
	import { page } from '$app/state';
	import { profile } from '$lib/stores/profileStore.svelte.js';
	import Entradas from '$lib/components/Acciones/Entradas.svelte';
	import CustomInput from '$lib/components/Formularios/CustomInput.svelte';
	import DatePicker from '$lib/components/Formularios/DatePicker.svelte';
	import EditableInput from '$lib/components/Formularios/EditableInput.svelte';
	import Card from '$lib/components/Tarjetas/Card.svelte';
	import FormEditableContact from '$lib/components/Vistas/Cliente/FormEditableContact.svelte';
	import SubirAdjunto from '$lib/components/Vistas/Documentos/SubirAdjunto.svelte';
	import SubirCotizacion from '$lib/components/Vistas/Documentos/SubirCotizacion.svelte';
	import SubirOcc from '$lib/components/Vistas/Documentos/SubirOcc.svelte';
	import TarjetaListaDocumentos from '$lib/components/Vistas/Documentos/TarjetaListaDocumentos.svelte';
	import AgentActions from '$lib/components/Vistas/Oportunidad/AgentActions.svelte';
	import OperActions from '$lib/components/Vistas/Oportunidad/OperActions.svelte';
	import PedidoRelacionado from '$lib/components/Vistas/Oportunidad/PedidoRelacionado.svelte';
	import RelacionarPedido from '$lib/components/Vistas/Oportunidad/RelacionarPedido.svelte';
	import { fases } from '$lib';
	import { formatCurrency, getStyleForPhase } from '$lib/utils/util.js';
	import FormOptionalInput from '$lib/components/Formularios/FormOptionalInput.svelte';
	import Pedidos from '$lib/components/Vistas/Pedidos/Pedidos.svelte';
	import TarjetaPedido from '$lib/components/Vistas/Pedidos/TarjetaPedido.svelte';
	import PedidosGanados from '$lib/components/Vistas/Pedidos/PedidosGanados.svelte';

	let { data } = $props();

	const clientes = $derived(page.data.clientes || []);
	const agentes = $derived(page.data.agentes || []);
	const pedidos = $derived(page.data.pedidos || []);
	const event = $derived(data.oportunidad);
	const eventData = $derived.by(() => {
		if (!event) return null;
		return {
			id: event.id,
			cotizaciones: event.docs_cotizaciones.sort(
				(a, b) => Number(b.pedidos?.length > 0) - Number(a.pedidos?.length > 0)
			),
			adjuntos: event.docs_adjuntos,
			occ: event.docs_occ,
			ocp: event.docs_ocp,
			cliente: clientes?.find((c: { id: any }) => c.id == event.id_cliente),
			agente: agentes?.find((e: { id: any }) => e.id == event.id_agente) ?? $profile,
			fase: fases.find((f) => f.id_fase == event.fase),
			motivo: event?.motivo,
			inicio: event?.inicio,
			fin: event?.fin,
			historia: event.historia,
			necesidades: event.necesidades,
			potencial_venta: event.potencial_venta,
			requisitos: event.requisitos,
			observaciones: event.observaciones,
			cotizaciones_ganadas: event.cotizaciones_ganadas,
			cotizaciones_presentadas: event.cotizaciones_presentadas,
			oc_cliente: event.oc_cliente,
			objetivo: event.objetivo,
			monto_oc: formatCurrency(event.monto_oc, 'USD'),
			etiquetas: event.etiquetas,
			pedidos: event.pedidos || [],
			style: getStyleForPhase(event.fase)
		};
	});
	let currentFase = $derived(eventData?.fase?.id_fase || 1);
	let editando = $state(false);
	console.log(event);
</script>

<Card headerStyle={eventData?.style}>
	{#snippet header()}
		<button
			onclick={() => history.back()}
			class="close {currentFase == 6 ? 'w' : ''}"
			aria-label="Cerrar"
		>
			✕
		</button>
		<div class="title">
			<h1>{eventData?.motivo}</h1>
			<a href="/clientes/{eventData?.cliente.id}"
				><h3>{eventData?.cliente.razon_social || eventData?.cliente.nombre_comercial}</h3></a
			>
		</div>
		<div class="meta">
			<p class="date">{eventData?.inicio}</p>
			<p class="date">|</p>
			<p>{eventData?.agente?.nombre}</p>
			<p>Fase: <strong>{eventData?.fase?.actual}</strong></p>
		</div>
	{/snippet}

	{#snippet content()}
		<EditableInput
			{editando}
			id={eventData?.id}
			label="Objetivo"
			name="objetivo"
			type="textarea"
			value={eventData?.objetivo}
			action="/oportunidades?/update"
			placeholder="Objetivo"
		>
			{#snippet header()}
				<input type="hidden" name="id" value={eventData?.id} />
			{/snippet}
		</EditableInput>

		<FormEditableContact
			lista={eventData?.cliente.contactos}
			id={eventData?.cliente.id}
			id_agente={$profile?.isAdmin ? eventData?.cliente.id_agente : $profile?.id}
			action="/clientes?/update"
			{editando}
		/>

		<EditableInput
			{editando}
			id={eventData?.id}
			label="Necesidades"
			name="necesidades"
			type="text"
			value={eventData?.necesidades}
			action="/oportunidades?/update"
			placeholder="Necesidades"
		/>

		<EditableInput
			{editando}
			id={eventData?.id}
			label="Requisitos"
			name="requisitos"
			type="text"
			value={eventData?.requisitos}
			action="/oportunidades?/update"
			placeholder="Requisitos"
		/>

		<EditableInput
			{editando}
			id={eventData?.id}
			label="Observaciones"
			name="observaciones"
			type="text"
			value={eventData?.observaciones}
			action="/oportunidades?/update"
			placeholder="Observaciones"
		/>

		{#if editando}
			<CustomInput label="Postergar" action="/oportunidades?/update" id={eventData?.id} {editando}>
				<DatePicker />
			</CustomInput>
		{/if}

		<section>
			<div class="header">
				<h3>Pedidos:</h3>
			</div>
			<div class="content">
				<FormOptionalInput title="+Potencial de venta">
					<RelacionarPedido id_oportunidad={eventData?.id} agente={eventData?.agente} />
				</FormOptionalInput>
				<FormOptionalInput title="historial pedidos">
					<div class="panel">
						{#each eventData?.pedidos as item}
							<TarjetaPedido {item} />
						{/each}
					</div>
				</FormOptionalInput>
			</div>
		</section>

		{#if currentFase == 1}
			<section>
				<div class="header">
					<h3>Potencial de venta:</h3>
				</div>
				<div class="content">
					{#if eventData?.pedidos.length > 0}
						<PedidoRelacionado
							pedidos={eventData?.pedidos ?? []}
							oportunidad={eventData}
							{editando}
							{currentFase}
						/>
					{/if}
					<FormOptionalInput title="+Potencial de venta">
						<RelacionarPedido id_oportunidad={eventData?.id} agente={eventData?.agente} />
					</FormOptionalInput>
				</div>
			</section>
		{/if}
		{#if currentFase >= 2 && currentFase <= 3}
			<section>
				<div class="header">
					<h3>Potencial de venta:</h3>
				</div>
				<div class="content">
					{#if eventData?.pedidos.length > 0}
						<PedidoRelacionado
							pedidos={eventData?.pedidos ?? []}
							oportunidad={eventData}
							{editando}
							{currentFase}
						/>
					{/if}
				</div>
			</section>
			<section>
				<div class="header">
					<h3>Cotizacion(es):</h3>
				</div>
				<div class="content">
					{#if eventData?.cotizaciones.length > 0}
						{#each eventData?.cotizaciones as documento}
							{#if documento.pedidos.some((p) => p.estatus == 3) || editando}
								<Pedidos
									{documento}
									pedidos={eventData?.pedidos ?? []}
									oportunidad={eventData}
									{editando}
								/>
							{/if}
						{/each}
					{/if}
				</div>
			</section>
		{/if}
		{#if currentFase >= 3 && currentFase <= 4}
			<section class="occ">
				<div class="header">
					<h3>Orden de compra:</h3>
				</div>
				<div class="content">
					{eventData?.occ.length}
					{#if eventData?.occ.length > 0}
						{#each eventData?.occ as documento}
							<PedidosGanados
								{documento}
								pedidos={eventData?.pedidos ?? []}
								oportunidad={eventData}
								{editando}
							/>
						{/each}
					{/if}
				</div>
			</section>
		{/if}

		<section class="adjunto">
			<div class="header">
				<h3>Adjuntos:</h3>
			</div>
			<div class="content">
				<FormOptionalInput title="+Adjuntos">
					<SubirAdjunto
						label="Adjuntos"
						name="docs_adjuntos"
						amountName="totales"
						id_nodo_p={eventData?.id}
						cliente={eventData?.cliente}
						agente={eventData?.agente}
						action="/documentos?/add"
						required
						multiple
					/>
				</FormOptionalInput>
				{#each eventData?.adjuntos as documento}
					<TarjetaListaDocumentos event={documento} />
				{/each}
			</div>
		</section>

		<section>
			<div class="header">
				<h3>Historia:</h3>
			</div>
			<div class="content">
				<Entradas
					{editando}
					historia={eventData?.historia}
					objId={eventData?.id}
					action={'/oportunidades?/update'}
				/>
			</div>
		</section>
	{/snippet}

	{#snippet actions()}
		{#if $profile?.isAdmin}
			{#if currentFase < 4}
				<AgentActions {eventData} bind:editando />
			{:else}
				<OperActions {eventData} />
			{/if}
		{:else if $profile?.isOper}
			<OperActions {eventData} />
		{:else}
			<AgentActions {eventData} bind:editando />
		{/if}
	{/snippet}
</Card>

<style>
	.meta {
		display: flex;
		gap: var(--a);
	}
	.w {
		color: white;
	}
</style>
