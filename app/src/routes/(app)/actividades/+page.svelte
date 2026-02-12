<script lang="ts">
	import CardD from '$lib/components/CardD.svelte';
	import { appState } from '$lib/stores/appState.svelte';
	import CalendarWeek from '$lib/views/CalendarWeek.svelte';
	import CalendarList from '$lib/views/CalendarList.svelte';
	import ControlsPanel from '$lib/components/ControlsPanel.svelte';
	import { selectedEvent } from '$lib/stores/selectedEvent.js';
	import { fly, slide } from 'svelte/transition';
	import { viewState } from '$lib/stores/ViewState.js';
	import ClientList from '$lib/views/AdminClientList.svelte';
	import { profile } from '$lib/stores/profileStore.svelte';
	import AdminClientList from '$lib/views/AdminClientList.svelte';
	import UserClientList from '$lib/views/UserClientList.svelte';

	let { data } = $props();
</script>

<div class="page-content">
	<section class="title">
		{#if $viewState.calendar}
			<h3>Calendario</h3>
		{:else if $viewState.list}
			<h3>Lista</h3>
		{:else if $viewState.resumen}
			<h3>Resumen</h3>
		{/if}
	</section>

	<section class="controls" in:fly>
		{#if $appState.pageActions}
			<ControlsPanel />
		{/if}
	</section>
	{#if $selectedEvent}
		<section class="selected" in:slide>
			<CardD />
		</section>
	{:else if $viewState.calendar}
		<section class="calendar" in:fly>
			<CalendarWeek actividades={data.actividades} />
		</section>
	{:else if $viewState.list}
		<section class="calendar" in:fly>
			<CalendarList actividades={data.actividades} />
		</section>
	{:else if $viewState.resumen}
		resume
	{:else if $viewState.clients}
		{#if $profile.isAdmin}
			<AdminClientList clients={data.clientes} agentes={data.agentes} />
		{:else}
			<UserClientList clients={data.clientes}/>
		{/if}
	{/if}
</div>

<style>
	.page-content {
		display: flex;
		flex-direction: column;
		overflow: auto;
	}
	.title {
		min-height: var(--d);
		display: flex;
		justify-content: end;
		margin-right: var(--a);
		align-items: center;
	}
	.selected {
		max-height: 90vh;
		height: 100%;
	}
	.controls {
		margin-top: var(--a);
		margin-bottom: var(--a);
	}
	.calendar {
		flex-grow: 1;
		overflow: auto;
		display: flex;
		flex-direction: column;
		gap: var(--a);
		min-height: var(--h);
	}
</style>
