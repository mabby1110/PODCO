<script lang="ts">
	import CardOpCalendarPreview from '$lib/components/Oportunidad/CardOpCalendarPreview.svelte';
	import { dropzone } from '$lib/actions/dnd';
	import { filtrarConsecutivo } from '$lib/utils/util';
	import { filterStore } from '$lib/stores/filterStore.svelte';
	import { appState } from '$lib/stores/appState.svelte';
	import { invalidate } from '$app/navigation';
	import {
		getWeekDates,
		isSameDay,
		formatDate,
		formatDateTime,
		calculateSlots,
		calculateDuration,
		formatWeekRange,
		getMonth
	} from '$lib/utils/agenda';
	import FilterOpList from '$lib/components/FilterOpList.svelte';
	import { profile } from '$lib/stores/profileStore.svelte';
	import type { Oportunidad } from '$lib';
	import CardActividadCalendarPreview from './Actividad/CardActividadCalendarPreview.svelte';
	import Leyenda from './Leyenda.svelte';
	import Reload from './Reload.svelte';

	const { events } = $props();

	const weekdays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sab', 'Dom'];
	const hoursRangePerDay = { start: 8, end: 19 };

	const PIXELS_PER_HOUR = 120;
	let SLOT_MINUTES = $state(10);
	let CELL_HEIGHT = $derived((PIXELS_PER_HOUR / 60) * SLOT_MINUTES);

	const hours = $derived(
		Array.from(
			{ length: ((hoursRangePerDay.end - hoursRangePerDay.start) * 60) / SLOT_MINUTES },
			(_, i) => {
				const total = hoursRangePerDay.start * 60 + i * SLOT_MINUTES;
				return {
					hour: Math.floor(total / 60),
					minute: total % 60
				};
			}
		)
	);

	const eventList = $derived(
		filterStore.atributo !== ''
			? filtrarConsecutivo(filterStore.atributo, 'id_agente', events)
			: events
	);

	const weekDates = $derived(getWeekDates(filterStore.weekOffset));
	const weekRangeText = $derived(formatWeekRange(weekDates));

	const weekEvents = $derived.by(() => {
		return eventList.filter((event: Oportunidad) => {
			const eventDate = new Date(event.inicio);
			return weekDates.some((weekDate) => isSameDay(eventDate, weekDate));
		});
	});

	async function handleDrop(eventId: string, hour: number, minute: number, targetDate: Date) {
		const event = eventList.find((e: { id: string }) => e.id === eventId);
		if (!event) return;

		const duration = calculateDuration(event.inicio, event.fin);
		const newStart = new Date(targetDate);
		newStart.setHours(hour, minute, 0, 0);
		const newEnd = new Date(newStart.getTime() + duration * 60 * 1000);

		const formData = new FormData();
		formData.append('id', eventId);
		formData.append('inicio', formatDateTime(newStart));
		formData.append('fin', formatDateTime(newEnd));

		if (event.id_cliente) {
			await fetch('/oportunidades?/updateOp', { method: 'POST', body: formData });
		} else {
			await fetch('/actividades?/updateActivity', { method: 'POST', body: formData });
		}
		await invalidate('app:calendar');
	}

	function getEvent(hour: number, minute: number, targetDate: Date) {
		return weekEvents.find((event: Oportunidad) => {
			const eventDate = new Date(event.inicio);
			// Corrección: para que el evento se vea aunque el SLOT sea mayor (ej. 60min),
			// comparamos si el inicio cae dentro del rango del slot actual
			const eventTotalMin = eventDate.getHours() * 60 + eventDate.getMinutes();
			const slotTotalMin = hour * 60 + minute;

			return (
				isSameDay(eventDate, targetDate) &&
				eventTotalMin >= slotTotalMin &&
				eventTotalMin < slotTotalMin + SLOT_MINUTES
			);
		});
	}

	function previousWeek() {
		filterStore.weekOffset -= 1;
	}
	function nextWeek() {
		filterStore.weekOffset += 1;
	}
	function goToCurrentWeek() {
		filterStore.weekOffset = 0;
	}
</script>

<div class="controls">
	<FilterOpList />
	<div class="calendar-navigation">
		<button onclick={previousWeek} class="butter nav-btn" title="Semana anterior"> ← </button>
		<button onclick={goToCurrentWeek} class="butter current-week">
			{weekRangeText}
		</button>
		<button onclick={nextWeek} class="butter nav-btn" title="Semana siguiente"> → </button>
	</div>
	<Reload />
	<button onclick={() => appState.toggleModalOp()} class="butter">+Oportunidad</button>
	<button onclick={() => appState.toggleModalActivity()} class="butter">+Actividad</button>


	<!-- <div class="slot-selector">
		<select id="slot-select" bind:value={SLOT_MINUTES} class="butter">
			<option value={10}>10 min</option>
			<option value={30}>30 min</option>
			<option value={60}>1 hora</option>
		</select>
	</div> -->

	{#if $profile?.isAdmin}
		<button onclick={() => appState.toggleDnd()} class="butter toggle" class:active={$appState.dnd}>
			✏️ Editar
		</button>
	{/if}
	<button onclick={() => appState.toggleMinimizedCalendarCards()} class="butter toggle">
		{$appState.calendarCards ? '📏 Min' : '📐 Max'}
	</button>
</div>

<div class="calendar" style="--dynamic-cell-height: {CELL_HEIGHT}px;">
	<table>
		<thead>
			<tr>
				<th class="corner"></th>
				{#each weekDates as date, i}
					<th>
						<div class="day-header">
							<div>{weekdays[i]}</div>
							<div class="date-label">{formatDate(date)}</div>
						</div>
					</th>
				{/each}
			</tr>
		</thead>
		<tbody>
			{#each hours as h}
				<tr>
					<td class="hour-cell">
						{String(h.hour).padStart(2, '0')}:{String(h.minute).padStart(2, '0')}
					</td>
					{#each weekDates as date}
						{@const event = getEvent(h.hour, h.minute, date)}
						<td
							class="{$appState.calendarCards ? 'max' : ''} event-cell"
							use:dropzone={{
								on_dropzone: (eventId: string) => handleDrop(eventId, h.hour, h.minute, date)
							}}
						>
							{#if event}
								{@const slots = calculateSlots(event.inicio, event.fin, SLOT_MINUTES)}
								{#if event.id_cliente}
									<CardOpCalendarPreview {event} style={`height:${slots * CELL_HEIGHT}px;`} />
								{:else}
									<CardActividadCalendarPreview
										{event}
										style={`height:${slots * CELL_HEIGHT}px;`}
									/>
								{/if}
							{/if}
						</td>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<!-- <Leyenda /> -->

<style>
	.calendar {
		flex-grow: 1;
		overflow: auto;
		display: flex;
		flex-direction: column;
		gap: 16px;
		border: 1px solid var(--color-muted);
		border-radius: var(--a);
	}
	.calendar table {
		flex-grow: 1;
		border-collapse: collapse;
		border-radius: 8px;
	}

	.calendar th,
	.calendar td {
		position: sticky;
		background-color: transparent;
		gap: 1px;
	}

	.calendar th {
		padding: 8px;
		position: sticky;
		top: 0;
		z-index: 9;
		backdrop-filter: blur(16px);
		border-bottom: 1px solid var(--color-secondary);
	}

	.day-header {
		display: flex;
		gap: 4px;
		align-items: baseline;
	}

	.date-label {
		font-size: 0.75em;
		opacity: 0.7;
		font-weight: normal;
	}

	.calendar .corner {
		position: sticky;
		top: 0;
		left: 0;
		z-index: 99;
	}

	.hour-cell {
		position: sticky;
		left: 0;
		z-index: 9;
		height: var(--dynamic-cell-height);
		display: flex;
		align-items: center;
		justify-content: center;
		backdrop-filter: blur(16px);
		font-size: 0.8em;
		padding: 0 8px;
		border-right: 1px solid var(--color-secondary);
	}

	.event-cell {
		position: relative;
		min-width: var(--e, 120px);
		border-right: 1px solid var(--color-secondary);
		border-bottom: 1px solid var(--color-secondary);
		overflow: visible;
		height: var(--dynamic-cell-height);
	}
	.max {
		min-width: var(--h);
		max-width: 60vw;
	}
	.current-week {
		text-align: center;
		flex-grow: 1;
	}

	.toggle.active {
		background: var(--color-highlight);
	}
	.calendar-navigation {
		display: flex;
		gap: var(--a);
	}
</style>
