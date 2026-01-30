<script lang="ts">
	import { appState } from '$lib/stores/appState.svelte';
	import { filterStore } from '$lib/stores/filterStore.svelte.js';
	import Filter from '$lib/components/Filter.svelte';
	import { selectedEvent } from '$lib/stores/selectedEvent';

	function previousWeek() {
		filterStore.weekOffset -= 1;
	}

	function nextWeek() {
		filterStore.weekOffset += 1;
	}

	function goToCurrentWeek() {
		filterStore.weekOffset = 0;
	}

	function handleView() {
		appState.toggleCalendarView();
		$selectedEvent = null;
	}
</script>

<div class="container">
	<Filter />
	<button onclick={() => appState.toggleModalOp()} class="butter">+Oportunidad</button>
	<button onclick={() => appState.toggleModalClient()} class="butter">+Cliente</button>
	<button onclick={() => appState.toggleModalActivity()} class="butter">+Actividad</button>
	<button onclick={handleView} class="butter primary">
		{$appState.calendarView ? '📋 Lista' : '📅 Calendario'}
	</button>
	<!-- Controles específicos del calendario -->
	{#if $appState.calendarView}
		<button onclick={() => appState.toggleDnd()} class="butter toggle" class:active={$appState.dnd}>
			✏️ {$appState.dnd ? 'Edición Activada' : 'Activar Edición'}
		</button>
		<button onclick={() => appState.toggleMinimizedCalendarCards()} class="butter toggle">
			{$appState.calendarCards ? '📏 Minimizar' : '📐 Expandir'}
		</button>
		<div class="calendar-navigation">
			<button onclick={previousWeek} class="butter nav-btn" title="Semana anterior"> ← </button>
			<button onclick={goToCurrentWeek} class="butter current-week"> Semana Actual </button>
			<button onclick={nextWeek} class="butter nav-btn" title="Semana siguiente"> → </button>
		</div>
	{/if}
</div>

<style>
	/* Panel de controles */
	.container {
		background: var(--color-contrast);
		backdrop-filter: blur(4px);
		border: 1px solid var(--color-muted);
		border-radius: var(--a);
		padding: var(--a);
		display: flex;
		flex-wrap: wrap;
		gap: var(--a);
		min-width: 300px;
	}

	.butter {
		font-weight: 500;
		white-space: nowrap;
	}
	.nav-btn {
		min-width: 50px;
	}

	.current-week {
		text-align: center;
		flex-grow: 1;
	}

	.toggle.active {
		background: var(--color-highlight);
		color: white;
	}
	.calendar-navigation {
		display: flex;
		gap: var(--a);
		flex-grow: 1;
	}
</style>
