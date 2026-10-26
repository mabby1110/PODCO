<script lang="ts">
	import { calendarStore } from '$lib/stores/calendarStore.svelte';
	import { appState } from '$lib/stores/appState.svelte';
	import { invalidateAll } from '$app/navigation';
	import { isSameDay, formatDate, formatDateTime, calculateDuration } from '$lib/utils/agenda';
	import { page } from '$app/state';
	import CSTarjetaActividad from './CSTarjetaActividad.svelte';
	import CSTarjetaOportunidad from './CSTarjetaOportunidad.svelte';
	import { filterData, sortData } from '$lib/utils/ModList';
	import { arrowScroll } from '$lib/actions/keyboardScroll';
	import { formatDateToReadable } from '$lib/utils/util';

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

	let containerHeight = $state(0);
	let headerHeight = $state(0);
	let expandedEventId = $state<string | null>(null);

	const weekdays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sab', 'Dom'];
	const BORDER_BOTTOM = 1;

	const monthDate = $derived.by(() => {
		const now = new Date();
		return new Date(now.getFullYear(), now.getMonth() + calendarStore.monthOffset, 1);
	});

	const monthDates = $derived.by(() => {
		const first = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
		const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
		const offset = (first.getDay() + 6) % 7;
		const weeks = Math.ceil((offset + daysInMonth) / 7);
		return Array.from(
			{ length: weeks * 7 },
			(_, i) => new Date(first.getFullYear(), first.getMonth(), 1 - offset + i)
		);
	});

	const rowsCount = $derived(monthDates.length / 7);

	const CELL_HEIGHT = $derived(
		$appState.calendarCards
			? 480
			: containerHeight > 0
				? Math.max(0, (containerHeight - headerHeight - BORDER_BOTTOM) / rowsCount)
				: 100
	);

	const EVENT_HEIGHT = $derived($appState.calendarCards ? 90 : 22);

	const monthEvents = $derived(
		eventList.filter((event) => {
			const eventDate = new Date(event.inicio);
			return monthDates.some((date) => isSameDay(eventDate, date));
		})
	);

	async function handleDrop(eventId: string, targetDate: Date) {
		const event = eventList.find((e) => e.id === eventId);
		if (!event) return;

		const duration = calculateDuration(event.inicio, event.fin);
		const oldStart = new Date(event.inicio);
		const newStart = new Date(targetDate);
		newStart.setHours(oldStart.getHours(), oldStart.getMinutes(), 0, 0);
		const newEnd = new Date(newStart.getTime() + duration * 60 * 1000);

		const formData = new FormData();
		formData.append('id', eventId);
		formData.append('inicio', formatDateTime(newStart));
		formData.append('fin', formatDateTime(newEnd));

		const action = event.id_cliente ? '/oportunidades?/updateOp' : '/actividades?/updateActivity';
		await fetch(action, { method: 'POST', body: formData });
		await invalidateAll();
	}

	function getEventsForDay(targetDate: Date) {
		return monthEvents
			.filter((event) => isSameDay(new Date(event.inicio), targetDate))
			.sort((a, b) => new Date(a.inicio).getTime() - new Date(b.inicio).getTime());
	}

	function wrapperStyle(expanded: boolean) {
		if (expanded) return undefined;
		return `height:${EVENT_HEIGHT}px;`;
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && expandedEventId) expandedEventId = null;
	}
	function handleWheel(e) {
		// alert('algo');
		e.preventDefault();
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<div
	class="calendar milk"
	style="
        --dynamic-cell-height: {CELL_HEIGHT}px; 
        --cols: 7; 
        --rows: {rowsCount};
        --col-min-width: {10 * (calendarStore.zoom || 1)}vw;
    "
>
	<div
		class="calendar-grid-container"
		bind:clientHeight={containerHeight}
		use:arrowScroll={{ step: 40, enabled: !expandedEventId }}
	>
		<div class="calendar-grid">
			{#each weekdays as day, i (day)}
				<div class="day-th" data-col={i} bind:clientHeight={headerHeight}>
					<div class="day-header">
						<div>{day}</div>
					</div>
				</div>
			{/each}

			{#each monthDates as date (date.toISOString())}
				{@const eventosDia = getEventsForDay(date)}
				<div
					class="event-cell"
					class:outside={date.getMonth() !== monthDate.getMonth()}
					class:con-scroll={eventosDia.length > 0}
				>
					<div class="date-label">
						{formatDate(date)}
					</div>
					<div class="event-stack">
						{#each eventosDia as event (event.id)}
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
								style={wrapperStyle(isExpanded)}
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
				</div>
			{/each}
		</div>
	</div>
</div>

<style>
	.calendar {
		display: flex;
		flex-direction: column;
		min-height: var(--j);
		min-width: var(--k);
		height: 100%;
		overflow: hidden;
		overflow-y: auto;
		overflow-x: auto;
		border-radius: 8px;
	}
	.calendar,
	.calendar :global(*) {
		box-sizing: border-box;
	}
	.calendar-grid-container {
		flex: 1 1 0;
		min-height: 0;
		position: relative;
	}
	.calendar-grid {
		display: grid;
		grid-template-columns: repeat(var(--cols), minmax(var(--col-min-width), 1fr));
		grid-template-rows: auto repeat(var(--rows), var(--dynamic-cell-height));
		min-width: 100%;
	}
	.day-th {
		position: sticky;
		top: 0;
		z-index: 11;
		padding: 8px;
		border-bottom: 1px solid var(--color-muted);
		border-right: 1px solid var(--color-muted);
		background-color: var(--color-primary);
	}
	.day-header {
		display: flex;
		flex-wrap: wrap;
		gap: 4px;
		align-items: baseline;
		justify-content: center;
	}
	.date-label {
		top: 0;
		opacity: 0.7;
		font-weight: normal;
		padding: 0 var(--a);
		flex-shrink: 0;
		position: sticky;
	}
	.date-label.today {
		background-color: var(--color-highlight);
		color: black;
		font-weight: bold;
		opacity: 1;
	}
	.event-cell {
		position: relative;
		display: flex;
		flex-direction: column;
		min-width: 0;
		min-height: 0;
		height: var(--dynamic-cell-height);
		pointer-events: none;
		border-bottom: 1px solid var(--color-muted);
		border-right: 1px solid var(--color-muted);
	}
	.event-cell.con-scroll {
		overflow-y: auto;
		pointer-events: all;
	}
	.event-cell.outside {
		opacity: 0.1;
		pointer-events: none;
	}
	.event-cell:has(.expanded) {
		overflow: visible;
		z-index: 9999;
	}
	.event-stack {
		display: flex;
		flex-direction: column;
		gap: var(--a);
		flex: 1 1 0;
		min-height: 0;
		border-radius: inherit;
		padding: var(--a);
	}
	.event-cell:has(.expanded) .event-stack {
		overflow: visible;
	}
	.event-wrapper {
		position: relative;
		flex-shrink: 0;
		width: 100%;
		user-select: none;
		-webkit-user-select: none;
		-webkit-touch-callout: none;
		cursor: pointer;
	}
	.event-wrapper.expanded {
		position: fixed;
		top: 40%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 90vw;
		max-width: var(--k);
		height: 80vh;
		min-height: var(--g);
		max-height: var(--i);
		z-index: 9999;
		margin: 0;
		cursor: default;
	}
</style>
