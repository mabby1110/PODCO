<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { StoreContextoRelacion } from '$lib/stores/pedidos/StoreContextoRelacion.svelte.js';
	import { StorePedidoEditar } from '$lib/stores/pedidos/StorePedidoEditar.svelte.js';
	import { profile } from '$lib/stores/profileStore.svelte';
	import { fasesOportunidad } from '$lib';
	import { StorePedidoNuevo } from '$lib/stores/pedidos/StorePedidoNuevo.svelte';
	import Card from '$lib/components/Tarjetas/Card.svelte';
	import TarjetaPedidoLista from '$lib/components/Vistas/Pedidos/TarjetaPedidoLista.svelte';
	import CustomInput from '$lib/components/Formularios/CustomInput.svelte';
	import DatePicker from '$lib/components/Formularios/DatePicker.svelte';
	import EditableInput from '$lib/components/Formularios/EditableInput.svelte';
	import FormEditableContact from '$lib/components/Vistas/Cliente/FormEditableContact.svelte';
	import AgentActions from '$lib/components/Vistas/Oportunidad/AgentActions.svelte';
	import FormOptionalInput from '$lib/components/Formularios/FormOptionalInput.svelte';
	import SubirAdjunto from '$lib/components/Vistas/Documentos/SubirAdjunto.svelte';
	import TarjetaListaDocumentos from '$lib/components/Vistas/Documentos/TarjetaListaDocumentos.svelte';
	import Entradas from '$lib/components/Acciones/Entradas.svelte';
	import TarjetaPedidoPotencial from '$lib/components/Vistas/Pedidos/TarjetaPedidoPotencial.svelte';
	import TarjetaPedidoCotizado from '$lib/components/Vistas/Pedidos/TarjetaPedidoCotizado.svelte';
	import TarjetaPedidoVenta from '$lib/components/Vistas/Pedidos/TarjetaPedidoVenta.svelte';

	onMount(() => StorePedidoEditar.toggleModal(false));

	// ESTADO
	const oportunidad = $derived(page.data.oportunidad);
	const potencial_venta = $derived(oportunidad.pedidos.some((p) => p.fase == 2));
	const ventas = $derived(oportunidad.pedidos.filter((p) => p.fase == 4) || []);
	let fase = $derived(fasesOportunidad[oportunidad.fase]);
	let editando = $state(false);

	// CRUD
	async function relacionarPedido() {
		StorePedidoEditar.limpiar();
		StorePedidoNuevo.limpiar();
		StoreContextoRelacion.setOportunidad(oportunidad.id);
		StorePedidoEditar.pushLista(oportunidad.pedidos.filter((p) => p.id_cotizacion == null));
		await goto('/pedidos');
		StorePedidoEditar.toggleModal(true);
	}
	async function editarPedido() {
		StorePedidoEditar.limpiar();
		StorePedidoNuevo.limpiar();
		StorePedidoEditar.pushLista(oportunidad.pedidos.filter((p) => p.id_cotizacion == null));
		StoreContextoRelacion.setOportunidad(oportunidad.id);
		await goto('/pedidos');
		StorePedidoEditar.toggleModal(true);
	}
</script>

<Card headerStyle={fase.estilo}>
	{#snippet header()}
		<div class="title">
			<h1>{oportunidad?.motivo}</h1>
			<a href="/clientes/{oportunidad?.clientes.id}"
				><h3>{oportunidad?.clientes.razon_social || oportunidad?.clientes.nombre_comercial}</h3></a
			>
		</div>
		<div class="meta">
			<p class="date">{oportunidad?.inicio}</p>
			<p class="date">|</p>
			<p>{oportunidad?.agente?.nombre}</p>
			<p>Fase: <strong>{oportunidad?.fase?.actual}</strong></p>
		</div>
	{/snippet}

	{#snippet content()}
		<EditableInput
			{editando}
			id={oportunidad?.id}
			label="Objetivo"
			name="objetivo"
			type="textarea"
			value={oportunidad?.objetivo}
			action="/oportunidades?/update"
			placeholder="Objetivo"
		>
			{#snippet header()}
				<input type="hidden" name="id" value={oportunidad?.id} />
			{/snippet}
		</EditableInput>

		<FormEditableContact
			lista={oportunidad?.clientes.contactos}
			id={oportunidad?.clientes.id}
			id_agente={$profile?.isAdmin ? oportunidad?.clientes.id_agente : $profile?.id}
			action="/clientes?/update"
			{editando}
		/>

		<EditableInput
			{editando}
			id={oportunidad?.id}
			label="Necesidades"
			name="necesidades"
			type="text"
			value={oportunidad?.necesidades}
			action="/oportunidades?/update"
			placeholder="Necesidades"
		/>

		<EditableInput
			{editando}
			id={oportunidad?.id}
			label="Requisitos"
			name="requisitos"
			type="text"
			value={oportunidad?.requisitos}
			action="/oportunidades?/update"
			placeholder="Requisitos"
		/>

		<EditableInput
			{editando}
			id={oportunidad?.id}
			label="Observaciones"
			name="observaciones"
			type="text"
			value={oportunidad?.observaciones}
			action="/oportunidades?/update"
			placeholder="Observaciones"
		/>

		{#if editando}
			<CustomInput
				label="Postergar"
				action="/oportunidades?/update"
				id={oportunidad?.id}
				{editando}
			>
				<DatePicker />
			</CustomInput>
		{/if}

		<!-- Borrador -->
		{#if fase.id_fase == 1}
			<section>
				<div class="header">
					<h3>Borrador:</h3>
				</div>

				<div class="content">
					{#if oportunidad.pedidos.length > 0}
						<TarjetaPedidoLista pedidos={oportunidad.pedidos} disable />
						{#if editando}
							<button onclick={editarPedido}>~Editar</button>
						{/if}
					{:else}
						<button class="butter" onclick={relacionarPedido}>+Potencial de venta</button>
					{/if}
				</div>
			</section>
		{/if}

		<!-- Potencia de venta & cotizado -->
		{#if fase.id_fase >= 2 && fase.id_fase <= 3}
			<section>
				<div class="header">
					<h3>Potencial de Venta:</h3>
				</div>

				<div class="block">
					{#if potencial_venta}
						<TarjetaPedidoPotencial {oportunidad} />
						{#if editando}
							<button class="butter" onclick={editarPedido}>~Editar</button>
						{/if}
					{:else}
						<button class="butter" onclick={relacionarPedido}>+Potencial de venta</button>
					{/if}
				</div>
			</section>

			<section>
				<div class="header">
					<h3>Cotizado:</h3>
				</div>

				<div class="block">
					{#if oportunidad.pedidos.length > 0}
						<TarjetaPedidoCotizado {oportunidad} />
					{/if}
				</div>
			</section>
		{/if}

		<!-- Cotizado y vendido -->
		{#if fase.id_fase >= 3}
			<section class="occ">
				<div class="header">
					<h3>Orden de compra:</h3>
				</div>
				<div class="content">
					{#if ventas.length > 0}
						<TarjetaPedidoVenta  {oportunidad} />
					{/if}
				</div>
			</section>
		{/if}
		<!-- {#if faseActual >= 2 && faseActual <= 3}
			<section>
				<div class="header">
					<h3>Potencial de venta:</h3>
				</div>
				<div class="content">
					{#if oportunidad?.pedidos.length > 0}
						<PedidoRelacionado
							pedidos={oportunidad?.pedidos ?? []}
							oportunidad={oportunidad}
							{editando}
							currentFase={faseActual}
						/>
					{/if}
				</div>
			</section>
			<section>
				<div class="header">
					<h3>Cotizacion(es):</h3>
				</div>
				<div class="content">
					{#if oportunidad?.cotizaciones.length > 0}
						{#each oportunidad?.cotizaciones as documento}
							{#if documento.pedidos.some((p) => p.fase == 3) || editando}{/if}
						{/each}
					{/if}
				</div>
			</section>
		{/if}-->

		<section class="adjunto">
			<div class="header">
				<h3>Adjuntos:</h3>
			</div>
			<div class="content">
				<FormOptionalInput title="+Adjuntos">
					<SubirAdjunto
						tipo="docs_adjuntos"
						oportunidad={{
							id: oportunidad?.id,
							cliente: oportunidad?.clientes.nombre_comercial || oportunidad?.clientes.razon_social
						}}
						required
					/>
				</FormOptionalInput>
				{#each oportunidad?.adjuntos as documento}
					<TarjetaListaDocumentos {documento} />
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
					historia={oportunidad?.historia}
					objId={oportunidad?.id}
					action={'/oportunidades?/actualizarOportunidad'}
				/>
			</div>
		</section>

		<AgentActions {oportunidad} bind:editando />
	{/snippet}
</Card>

<style>
	.meta {
		display: flex;
		gap: var(--a);
	}
</style>
