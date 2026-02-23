<script lang="ts">
	import CardOportunidad from '$lib/components/CardOportunidad.svelte';
	import CalendarWeek from '$lib/views/CalendarWeek.svelte';
	import CalendarList from '$lib/views/CalendarList.svelte';
	import { selectedOp } from '$lib/stores/selectedOp.js';
	import {  slide } from 'svelte/transition';
	import { viewState } from '$lib/stores/ViewState.js';
	import { selectedClient } from '$lib/stores/selectedClient.js';
	import CardCliente from '$lib/components/CardCliente.svelte';
	import ClientList from '$lib/views/ClientList.svelte';

	let { data } = $props();
</script>

<div class="page-content">
	{#if $selectedOp}
		<section class="selected" in:slide>
			<CardOportunidad />
		</section>
	{:else if $viewState.calendar}
		<section in:slide>
			<CalendarWeek actividades={data.actividades} />
		</section>
	{:else if $viewState.list}
		<section in:slide>
			<CalendarList actividades={data.actividades} />
		</section>
	{/if}

	{#if $viewState.clients}
		{#if $selectedClient}
			<section class="selected" in:slide>
				<CardCliente />
			</section>
		{:else}
			<section in:slide>
				<ClientList clients={data.clientes} agentes={data.agentes} />
			</section>
		{/if}
	{/if}
</div>

<style>
	.page-content {
		display: flex;
		flex-direction: column;
		overflow: auto;
	}
	section {
		flex-grow: 1;
		overflow: auto;
		display: flex;
		flex-direction: column;
		min-height: var(--h);
	}
	.selected {
		max-height: 90vh;
		height: 100%;
	}
</style>
