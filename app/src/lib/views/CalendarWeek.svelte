<script lang="ts">
	import CardA from '$lib/components/CardA.svelte';
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
	import Filter from '$lib/components/Filter.svelte';
	import { profile } from '$lib/stores/profileStore.svelte';

	const { actividades } = $props();

	const weekdays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sab', 'Dom'];
	const hoursRangePerDay = { start: 8, end: 19 };
	const SLOT_MINUTES = 10;
	const CELL_HEIGHT = 24;

	// Generar slots de tiempo
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

	// Filtrar eventos
	const eventList = $derived(
		filterStore.atributo !== ''
			? filtrarConsecutivo(filterStore.atributo, 'id_agente', actividades)
			: actividades
	);

	// Fechas de la semana
	const weekDates = $derived(getWeekDates(filterStore.weekOffset));
	const weekRangeText = $derived(formatWeekRange(weekDates));
	const currentMonth = $derived(getMonth(weekDates[0], true));
	// Eventos de la semana
	const weekEvents = $derived.by(() => {
		return eventList.filter((event) => {
			const eventDate = new Date(event.inicio);
			return weekDates.some((weekDate) => isSameDay(eventDate, weekDate));
		});
	});

	async function handleDrop(eventId: string, hour: number, minute: number, targetDate: Date) {
		const event = eventList.find((e) => e.id_oportunidad === eventId);
		if (!event) return;

		// Calcular duración original en minutos
		const duration = calculateDuration(event.inicio, event.fin);

		// Nueva fecha de inicio
		const newStart = new Date(targetDate);
		newStart.setHours(hour, minute, 0, 0);

		// Nueva fecha de fin
		const newEnd = new Date(newStart.getTime() + duration * 60 * 1000);

		const formData = new FormData();
		formData.append('id', eventId);
		formData.append('inicio', formatDateTime(newStart));
		formData.append('fin', formatDateTime(newEnd));

		await fetch('?/update', { method: 'POST', body: formData });
		await invalidate('app:data');
	}

	function getEvent(hour: number, minute: number, targetDate: Date) {
		return weekEvents.find((event) => {
			const eventDate = new Date(event.inicio);
			return (
				isSameDay(eventDate, targetDate) &&
				eventDate.getHours() === hour &&
				eventDate.getMinutes() === minute
			);
		});
	}

	function isEventStart(hour: number, minute: number, targetDate: Date, event) {
		const eventDate = new Date(event.inicio);
		return (
			isSameDay(eventDate, targetDate) &&
			eventDate.getHours() === hour &&
			eventDate.getMinutes() === minute
		);
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

<div class="calendar-controls">
	<h3>Calendario</h3>
	<div class="calendar-navigation">
		<button onclick={previousWeek} class="butter nav-btn" title="Semana anterior"> ← </button>
		<button onclick={goToCurrentWeek} class="butter current-week">
			{weekRangeText}
		</button>
		<button onclick={nextWeek} class="butter nav-btn" title="Semana siguiente"> → </button>
	</div>
	{#if $profile?.isAdmin}
		<button onclick={() => appState.toggleDnd()} class="butter toggle" class:active={$appState.dnd}>
			✏️ Editar
		</button>
	{/if}
	<button onclick={() => appState.toggleMinimizedCalendarCards()} class="butter toggle">
		{$appState.calendarCards ? '📏 Min' : '📐 Max'}
	</button>
	<Filter />
</div>

<div class="calendar-container">
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
							{#if event && isEventStart(h.hour, h.minute, date, event)}
								<div
									class="event-wrapper"
									style={`height:${calculateSlots(event.inicio, event.fin, SLOT_MINUTES) * CELL_HEIGHT}px`}
								>
									<CardA
										{event}
										style={`height:${calculateSlots(event.inicio, event.fin, SLOT_MINUTES) * CELL_HEIGHT}px`}
									/>
								</div>
							{/if}
						</td>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<style>
	.calendar-container {
		flex-grow: 1;
		overflow: auto;
		display: flex;
		flex-direction: column;
		gap: 16px;
		border: 1px solid var(--color-muted);
		border-radius: var(--a);
	}
	.calendar-controls {
		display: flex;
		flex-wrap: wrap;
		gap: var(--a);
		padding: 0 0 var(--b);
		justify-content: flex-end;
	}
	.calendar-controls h3 {
		flex-grow: 1;
	}
	.calendar-container table {
		flex-grow: 1;
		border-collapse: collapse;
		border-radius: 8px;
	}

	.calendar-container th,
	.calendar-container td {
		position: sticky;
		background-color: transparent;
		gap: 1px;
	}

	.calendar-container th {
		padding: 8px;
		position: sticky;
		top: 0;
		z-index: 9;
		backdrop-filter: blur(16px);
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

	.calendar-container .corner {
		position: sticky;
		top: 0;
		left: 0;
		z-index: 99;
	}

	.hour-cell {
		position: sticky;
		left: 0;
		z-index: 9;
		height: var(--c);
		display: flex;
		justify-content: center;
		backdrop-filter: blur(16px);
	}

	.event-cell {
		position: relative;
		min-width: var(--e);
		border-right: 1px solid var(--color-secondary);
		border-bottom: 1px solid var(--color-secondary);
		overflow: visible;
	}
	.event-wrapper {
		z-index: 1;
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: fit-content;
		cursor: pointer;
		pointer-events: auto; /* La celda NO captura eventos */
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
