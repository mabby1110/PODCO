<script lang="ts">
	import { slide } from 'svelte/transition';
	import { viewState } from '$lib/stores/ViewState.js';
	import CalendarWeek from '$lib/views/CalendarWeek.svelte';
	import OpList from '$lib/views/OpList.svelte';
	import ClientList from '$lib/views/ClientList.svelte';
	import ActivityList from '$lib/views/ActivityList.svelte';
	import CardOportunidad from '$lib/components/CardOportunidad.svelte';
	import CardCliente from '$lib/components/Oportunidad/CardCliente.svelte';
	import { selectedOp } from '$lib/stores/selectedOp.js';
	import { selectedClient } from '$lib/stores/selectedClient.js';
	import { selectedActivity } from '$lib/stores/selectedActivity.js';

	let { data } = $props();
</script>

<div class="page-content">
	{#if $viewState.calendar}
		{#if $selectedOp}
			<section class="selected" in:slide>
				<CardOportunidad />
			</section>
		{:else}
			<section in:slide>
				<CalendarWeek actividades={data.actividades} />
			</section>
		{/if}
	{:else if $viewState.op}
		{#if $selectedOp}
			<section class="selected" in:slide>
				<CardOportunidad />
			</section>
		{:else}
			<section in:slide>
				<OpList oportunidades={data.oportunidades} />
			</section>
		{/if}
	{:else if $viewState.clients}
		{#if $selectedClient}
			<section class="selected" in:slide>
				<CardCliente />
			</section>
		{:else}
			<section in:slide>
				<ClientList clients={data.clientes} agentes={data.agentes} />
			</section>
		{/if}
	{:else if $viewState.activities}
		{#if $selectedActivity}
			card actividades
		{:else}
			<ActivityList actividades={data.actividades} />
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
