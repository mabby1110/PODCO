<script lang="ts">
	import CardOpCalendarPreview from '$lib/components/Oportunidad/CardOpCalendarPreview.svelte';
	import { dropzone } from '$lib/actions/dnd';
	import { calendarStore } from '$lib/stores/calendarStore.svelte';
	import { appState } from '$lib/stores/appState.svelte';
	import { invalidateAll } from '$app/navigation';
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

	import { profile } from '$lib/stores/profileStore.svelte';
	import { type Oportunidad } from '$lib';
	import CardActividadCalendarPreview from './Actividad/CardActividadCalendarPreview.svelte';
	import Reload from './Reload.svelte';
	import FiltroAgente from './FiltroAgente.svelte';

	let { listaAgrupada } = $props<{
		listaAgrupada: any[];
	}>();

	const weekdays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sab', 'Dom'];

	const hoursRangePerDay = { start: 8, end: 19 };
	const totalHours = hoursRangePerDay.end - hoursRangePerDay.start;

	let SLOT_MINUTES = $derived($appState.calendarCards ? 10 : 60);

	let calendarHeight = $state(0);

	const PIXELS_PER_HOUR = $derived(
		$appState.calendarCards ? 120 : calendarHeight > 0 ? (calendarHeight - 60) / totalHours : 60
	);

	let CELL_HEIGHT = $derived((PIXELS_PER_HOUR / 60) * SLOT_MINUTES);

	const hours = $derived(
		Array.from({ length: (totalHours * 60) / SLOT_MINUTES }, (_, i) => {
			const total = hoursRangePerDay.start * 60 + i * SLOT_MINUTES;
			return {
				hour: Math.floor(total / 60),
				minute: total % 60
			};
		})
	);

	const eventList = $derived(listaAgrupada.flatMap((agrupacion: any) => agrupacion.elementos));
	const weekDates = $derived(getWeekDates(calendarStore.weekOffset));
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
		await invalidateAll();
	}

	function getEventsForSlot(hour: number, minute: number, targetDate: Date) {
		return weekEvents.filter((event: Oportunidad) => {
			const eventDate = new Date(event.inicio);
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
		calendarStore.weekOffset -= 1;
	}
	function nextWeek() {
		calendarStore.weekOffset += 1;
	}
	function goToCurrentWeek() {
		calendarStore.weekOffset = 0;
	}
</script>

<div class="view-container">
	<div class="controls">
		<Reload />
		<button onclick={() => appState.toggleModalOp()} class="butter">+Oportunidad</button>
		<button onclick={() => appState.toggleModalActivity()} class="butter">+Actividad</button>

		<FiltroAgente />

		{#if $profile?.isAdmin}
			<button
				onclick={() => appState.toggleDnd()}
				class="butter toggle"
				class:active={$appState.dnd}
			>
				✏️ Editar
			</button>
		{/if}
		<button onclick={() => appState.toggleMinimizedCalendarCards()} class="butter toggle">
			{$appState.calendarCards ? '📏 Min' : '📐 Max'}
		</button>
	</div>
	<div class="calendar" bind:clientHeight={calendarHeight} style="--dynamic-cell-height: {CELL_HEIGHT}px;">
		<table>
			<thead>
				<tr>
					<th class="corner">{getMonth(weekDates[0])}</th>
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
							{@const eventosSuperpuestos = getEventsForSlot(h.hour, h.minute, date)}
							<td
								class="{$appState.calendarCards ? 'max' : ''} event-cell"
								use:dropzone={{
									on_dropzone: (eventId: string) => handleDrop(eventId, h.hour, h.minute, date)
								}}
							>
								{#if eventosSuperpuestos.length > 0}
									<div class="event-stack">
										{#each eventosSuperpuestos as event, index}
											{@const slots = calculateSlots(event.inicio, event.fin, SLOT_MINUTES)}
											{@const totalConcurrentes = eventosSuperpuestos.length}

											<div
												class="event-wrapper"
												style="
                                                    width: {100 / totalConcurrentes}%;
                                                    left: {(100 / totalConcurrentes) * index}%;
                                                    height: {slots * CELL_HEIGHT}px;
													min-height: var(--d);
                                                    z-index: {10 + index};
                                                "
											>
												{#if event.id.toLowerCase().includes('op')}
													<CardOpCalendarPreview {event} style="height: 100%; width: 100%;" />
												{:else}
													<CardActividadCalendarPreview
														{event}
														style="height: 100%; width: 100%;"
													/>
												{/if}
											</div>
										{/each}
									</div>
								{/if}
							</td>
						{/each}
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	<div class="calendar-navigation">
		<button onclick={previousWeek} class="butter nav-btn" title="Semana anterior"> ← </button>
		<button onclick={goToCurrentWeek} class="butter current-week">
			{weekRangeText}
		</button>
		<button onclick={nextWeek} class="butter nav-btn" title="Semana siguiente"> → </button>
	</div>
</div>

<style>
	.view-container {
		height: 100%;
	}
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
		z-index: 1;
	}

	.event-cell:has(.event-wrapper:hover) {
		z-index: 100;
	}

	.event-stack {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		overflow: visible;
	}

	.event-wrapper {
		position: absolute;
		top: 0;
		box-shadow: -2px 0px 5px rgba(0, 0, 0, 0.1);
		transition:
			width 0.2s ease,
			min-height 0.2s ease,
			box-shadow 0.2s ease,
			z-index 0s;
		user-select: none; /* Evita que el texto se sombree/seleccione */
		-webkit-user-select: none; /* Para Safari y Chrome en móviles */
		-webkit-touch-callout: none;
	}

	.event-wrapper:hover {
		z-index: 999 !important;
		width: 120% !important;
		max-width: 80vw;
		min-height: 40vh !important;
	}
	.event-wrapper:active {
		z-index: 999 !important;
		width: 150% !important;
		min-height: var(--g) !important;
		height: auto !important;
		box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
		transition-delay: 0.15s;
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
		width: 100%;
		max-width: fit-content;
		min-width: 40vw;
		align-self: flex-end;
	}
</style>
