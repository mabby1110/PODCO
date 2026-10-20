<script lang="ts">
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

	import { page } from '$app/state';
	import Vista from '$lib/components/Tarjetas/Vista.svelte';
	import CSTarjetaActividad from './CSTarjetaActividad.svelte';
	import CSTarjetaOportunidad from './CSTarjetaOportunidad.svelte';
	import ModList from '$lib/components/Acciones/ModList.svelte';
	import { extraerColumnas, filterData, sortData } from '$lib/utils/ModList';
	import Controles from '$lib/components/Acciones/Controles.svelte';
	import { arrowScroll } from '$lib/actions/keyboardScroll';

	let { oportunidades, actividades } = $derived(page.data);
	let allActivities = $derived(oportunidades.concat(actividades));
	let currentRoute = $derived(page.url.pathname);

	let lista = $derived.by(() => {
		if ($appState.calendarList === 'actividades') return actividades;
		if ($appState.calendarList === 'oportunidades') return oportunidades;
		return allActivities;
	});

	let lista_ordenada = $derived(sortData(lista, currentRoute));
	let eventList = $derived(filterData(lista_ordenada, currentRoute));

	let SLOT_MINUTES = $derived($appState.calendarCards ? 10 : 60);

	// Medidas reales: alto del contenedor scrolleable y de la fila de cabecera
	let containerHeight = $state(0);
	let headerHeight = $state(0);
	let expandedEventId = $state<string | null>(null);

	const weekdays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sab', 'Dom'];
	const hoursRangePerDay = { start: 8, end: 19 };
	const totalHours = hoursRangePerDay.end - hoursRangePerDay.start;
	const BORDER_BOTTOM = 1;

	// Min: reparte el alto disponible entre las horas (sin scroll vertical).
	// Max: 120px por hora (hay scroll).
	const PIXELS_PER_HOUR = $derived(
		$appState.calendarCards
			? 120
			: containerHeight > 0
				? Math.max(0, (containerHeight - headerHeight - BORDER_BOTTOM) / totalHours)
				: 60
	);
	const CELL_HEIGHT = $derived((PIXELS_PER_HOUR / 60) * SLOT_MINUTES);

	const hours = $derived(
		Array.from({ length: (totalHours * 60) / SLOT_MINUTES }, (_, i) => {
			const total = hoursRangePerDay.start * 60 + i * SLOT_MINUTES;
			return { hour: Math.floor(total / 60), minute: total % 60 };
		})
	);

	const weekDates = $derived(getWeekDates(calendarStore.weekOffset));
	const weekRangeText = $derived(formatWeekRange(weekDates));
	const weekEvents = $derived(
		eventList.filter((event) => {
			const eventDate = new Date(event.inicio);
			return weekDates.some((weekDate) => isSameDay(eventDate, weekDate));
		})
	);

	async function handleDrop(eventId: string, hour: number, minute: number, targetDate: Date) {
		const event = eventList.find((e) => e.id === eventId);
		if (!event) return;

		const duration = calculateDuration(event.inicio, event.fin);
		const newStart = new Date(targetDate);
		newStart.setHours(hour, minute, 0, 0);
		const newEnd = new Date(newStart.getTime() + duration * 60 * 1000);

		const formData = new FormData();
		formData.append('id', eventId);
		formData.append('inicio', formatDateTime(newStart));
		formData.append('fin', formatDateTime(newEnd));

		const action = event.id_cliente ? '/oportunidades?/updateOp' : '/actividades?/updateActivity';
		await fetch(action, { method: 'POST', body: formData });
		await invalidateAll();
	}

	function getEventsForSlot(hour: number, minute: number, targetDate: Date) {
		const slotTotalMin = hour * 60 + minute;
		return weekEvents.filter((event) => {
			const eventDate = new Date(event.inicio);
			const eventTotalMin = eventDate.getHours() * 60 + eventDate.getMinutes();
			return (
				isSameDay(eventDate, targetDate) &&
				eventTotalMin >= slotTotalMin &&
				eventTotalMin < slotTotalMin + SLOT_MINUTES
			);
		});
	}

	function wrapperStyle(expanded: boolean, index: number, total: number, slots: number) {
		if (expanded) return undefined; // lo maneja .expanded en CSS
		return `width:${100 / total}%;left:${(100 / total) * index}%;height:${slots * CELL_HEIGHT}px;z-index:${10 + index};`;
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && expandedEventId) expandedEventId = null;
	}
	let containerEl = $state<HTMLDivElement>();

	$effect(() => {
		if (!$appState.calendarCards || !containerEl) return;

		const index = weekDates.findIndex((d) => isSameDay(d, new Date()));
		if (index === -1) {
			containerEl.scrollTo({ left: 0 });
			return;
		}

		const th = containerEl.querySelector<HTMLElement>(`[data-col="${index}"]`);
		const hourColWidth = containerEl.querySelector<HTMLElement>('.corner')?.offsetWidth ?? 0;
		if (th) containerEl.scrollTo({ left: th.offsetLeft - hourColWidth, behavior: 'smooth' });
	});
</script>

<svelte:window onkeydown={handleKeydown} />

{#if expandedEventId}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="backdrop"
		onclick={(e) => {
			e.stopPropagation();
			expandedEventId = null;
		}}
	></div>
{/if}
<div
	class="calendar tarjeta"
	style="--dynamic-cell-height: {CELL_HEIGHT}px; --cols: {weekDates.length}; --rows: {hours.length};"
>
	<h1 class="month-title">{getMonth(weekDates[0])}</h1>

	<div
		class="calendar-grid-container"
		class:max={$appState.calendarCards}
		bind:clientHeight={containerHeight}
		bind:this={containerEl}
		use:arrowScroll={{ step: 40, enabled: !expandedEventId }}
	>
		<div class="calendar-grid" class:max={$appState.calendarCards}>
			<!-- Fila 1: cabeceras (días) + esquina a la derecha -->
			<div class="corner" bind:clientHeight={headerHeight}></div>
			{#each weekDates as date, i (date.toISOString())}
				<div class="day-th" data-col={i}>
					<div class="day-header">
						<div>{weekdays[i]}</div>
						<div class="date-label">{formatDate(date)}</div>
					</div>
				</div>
			{/each}

			<!-- Filas: celdas de eventos + hora a la derecha -->
			{#each hours as h (h.hour * 60 + h.minute)}
				<div class="hour-cell">
					{String(h.hour).padStart(2, '0')}:{String(h.minute).padStart(2, '0')}
				</div>
				{#each weekDates as date (date.toISOString())}
					{@const eventosSuperpuestos = getEventsForSlot(h.hour, h.minute, date)}
					<div
						class="event-cell"
						use:dropzone={{
							on_dropzone: (eventId: string) => handleDrop(eventId, h.hour, h.minute, date)
						}}
					>
						{#if eventosSuperpuestos.length > 0}
							<div class="event-stack">
								{#each eventosSuperpuestos as event, index (event.id)}
									{@const slots = calculateSlots(event.inicio, event.fin, SLOT_MINUTES)}
									{@const isExpanded = expandedEventId === event.id}

									<!-- svelte-ignore a11y_click_events_have_key_events -->
									<!-- svelte-ignore a11y_no_static_element_interactions -->
									<div
										class="event-wrapper"
										class:expanded={isExpanded}
										onclick={(e) => {
											e.stopPropagation();
											expandedEventId = isExpanded ? null : event.id;
										}}
										style={wrapperStyle(isExpanded, index, eventosSuperpuestos.length, slots)}
									>
										{#if event.id.toLowerCase().includes('op')}
											<CSTarjetaOportunidad
												oportunidad={event}
												style="height: 100%; width: 100%;"
												expanded={isExpanded}
											/>
										{:else}
											<CSTarjetaActividad
												actividad={event}
												style="height: 100%; width: 100%;"
												expanded={isExpanded}
											/>
										{/if}
									</div>
								{/each}
							</div>
						{/if}
					</div>
				{/each}
			{/each}
		</div>
	</div>
</div>

<style>
	.backdrop {
		position: fixed;
		inset: 0;
		cursor: pointer;
	}
	.calendar {
		display: flex;
		flex-direction: column;
		height: 100%;
		overflow: hidden;
		border-radius: 8px;
	}
	.calendar,
	.calendar :global(*) {
		box-sizing: border-box;
	}
	.month-title {
		text-align: center;
		font-size: 1.2em;
		font-weight: bold;
		padding: 12px;
		border-bottom: 1px solid var(--color-muted);
		z-index: 10;
		flex-shrink: 0;
	}
	.calendar-grid-container {
		flex: 1 1 0;
		min-height: 0;
		overflow-x: auto;
		overflow-y: hidden;
		position: relative;
	}
	.calendar-grid-container.max {
		overflow-y: auto;
	}
	.calendar-grid {
		display: grid;
		grid-template-columns: max-content repeat(var(--cols), minmax(0, 1fr));
		grid-template-rows: auto repeat(var(--rows), var(--dynamic-cell-height));
		min-width: 100%;
		gap: 0;
	}
	.calendar-grid.max {
		grid-template-columns: max-content repeat(var(--cols), 80vw);
		width: max-content;
	}
	.corner {
		position: sticky;
		top: 0;
		left: 0;
		border-right: 1px solid var(--color-muted);
		border-bottom: 1px solid var(--color-muted);
	}
	.day-th {
		position: sticky;
		top: 0;
		padding: 8px;
		border-right: 1px solid var(--color-muted);
		border-bottom: 1px solid var(--color-muted);
	}

	.day-header {
		display: flex;
		flex-wrap: wrap;
		gap: 4px;
		align-items: baseline;
		justify-content: center;
	}

	.date-label {
		font-size: 0.75em;
		opacity: 0.7;
		font-weight: normal;
	}

	.hour-cell {
		position: sticky;
		left: 0;
		border-right: 1px solid var(--color-muted);
		border-bottom: 1px solid var(--color-muted);
		background: var(--bg-color, transparent);
		backdrop-filter: blur(16px);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0 6px;
		font-size: 0.8em;
		height: var(--dynamic-cell-height);
		white-space: nowrap;
		z-index: 99;
	}

	.event-cell {
		position: relative;
		min-width: 0;
		height: var(--dynamic-cell-height);
		border-bottom: 1px solid var(--color-muted);
	}

	.event-cell:has(.expanded) {
		z-index: 9999;
	}

	.event-stack {
		position: absolute;
		inset: 0;
		overflow: visible;
	}

	.event-wrapper {
		position: absolute;
		top: 0;
		min-height: var(--d);
		box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
		transition:
			box-shadow 0.2s ease,
			z-index 0s;
		user-select: none;
		-webkit-user-select: none;
		-webkit-touch-callout: none;
		cursor: pointer;
	}

	.event-wrapper.expanded {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 80vw;
		max-width: 80vw;
		height: 80vh;
		min-height: var(--g);
		max-height: var(--i);
		z-index: 9999;
		box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
		margin: 0;
		cursor: default;
	}
</style>
