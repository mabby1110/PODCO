<script lang="ts">
	import CardD from '$lib/components/CardD.svelte';
	import CalendarWeek from '$lib/components/CalendarWeek.svelte';
	import { appState } from '$lib/stores/appState.svelte';
	import CalendarList from '$lib/components/CalendarList.svelte';
	import ControlsPanel from '$lib/components/ControlsPanel.svelte';

	let { data } = $props();
</script>

<div class="page-content">
	<section class="title">
		<h3>{$appState.calendarView ? 'Semana' : 'Lista'}</h3>
	</section>

	<section class="selected">
		<CardD />
	</section>

	<section class="controls">
		{#if $appState.pageActions}
			<ControlsPanel />
		{/if}
	</section>

	<section class="calendar">
		{#if $appState.calendarView}
			<CalendarWeek actividades={data.actividades} />
		{:else}
			<CalendarList actividades={data.actividades} />
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
	.controls {
		margin-bottom: var(--a);
	}
	.calendar {
		flex-grow: 1;
		overflow: auto;
		display: flex;

		min-height: var(--g);
	}
</style>
