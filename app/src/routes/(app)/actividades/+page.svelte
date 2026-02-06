<script lang="ts">
	import CardD from '$lib/components/CardD.svelte';
	import { appState } from '$lib/stores/appState.svelte';
	import CalendarWeek from '$lib/views/CalendarWeek.svelte';
	import CalendarList from '$lib/views/CalendarList.svelte';
	import ControlsPanel from '$lib/components/ControlsPanel.svelte';
	import { selectedEvent } from '$lib/stores/selectedEvent.js';
	import { fly, slide } from 'svelte/transition';
	import { viewState } from '$lib/stores/ViewState.js';

	let { data } = $props();
</script>

<div class="page-content">
	<section class="title">
		<h3>{$appState.calendarView ? 'Semana' : 'Lista'}</h3>
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
	{/if}

	<section class="controls" in:fly>
		{#if $appState.pageActions}
			<ControlsPanel />
		{/if}
	</section>
</div>

<style>
	.page-content {
		display: flex;
		flex-direction: column;
		overflow: auto;
	}
	.title {
		min-height: var(--d);
		margin-bottom: var(--a);
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
