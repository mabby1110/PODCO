<script lang="ts">
	import { slide } from 'svelte/transition';
	import { viewState } from '$lib/stores/ViewState.js';
	
	import CalendarWeek from '$lib/components/Views/CalendarWeek.svelte';
	import OpList from '$lib/components/Views/OpList.svelte';
	import ClientList from '$lib/components/Views/ClientList.svelte';
	import ActivityList from '$lib/components/Views/ActivityList.svelte';

	import CardOportunidad from '$lib/components/Oportunidad/CardOportunidad.svelte';
	import CardCliente from '$lib/components/Cliente/CardCliente.svelte';


	import { selectedOp } from '$lib/stores/selectedOp.js';
	import { selectedClient } from '$lib/stores/selectedClient.js';
	import { selectedActivity } from '$lib/stores/selectedActivity.js';
	import CardActividad from '$lib/components/Actividad/CardActividad.svelte';

	let { data } = $props();
	let allActivities = $derived(data.oportunidades.concat(data.actividades));
	console.log(typeof data.oportunidades);
</script>

<div class="page-content">
	{#if $viewState.calendar}
		{#if $selectedOp}
			<section class="selected" in:slide>
				<CardOportunidad />
			</section>
		{:else if $selectedActivity}
			<CardActividad />
		{:else}
			<section in:slide>
				<CalendarWeek events={allActivities} />
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
			<CardActividad />
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
