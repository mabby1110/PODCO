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
	import PanelFiltros from '$lib/components/Acciones/PanelFiltros.svelte';
	import ModList from '$lib/components/Acciones/ModList.svelte';
	import { extraerColumnas, filterData, groupData, sortData } from '$lib/utils/ModList';

	let { oportunidades, actividades } = $derived(page.data);
	let allActivities = $derived(oportunidades.concat(actividades));
	let currentRoute = $derived(page.url.pathname);

	let lista = $derived.by(() => {
		if ($appState.calendarList == 'actividades') {
			return actividades;
		} else if ($appState.calendarList == 'oportunidades') {
			return oportunidades;
		} else {
			return allActivities;
		}
	});

	let columnasDinamicas = $derived(
		Array.from(
			new Map(
				[...extraerColumnas(oportunidades), ...extraerColumnas(actividades)].map((col) => [
					col.key,
					col
				])
			).values()
		)
	);

	$effect(() => {
		lista = allActivities;
	});

	let lista_ordenada = $derived(sortData(lista, currentRoute));
	let lista_filtrada = $derived(filterData(lista_ordenada, currentRoute));

	let SLOT_MINUTES = $derived($appState.calendarCards ? 10 : 60);
	let calendarHeight = $state(0);

	let expandedEventId = $state<string | null>(null);

	const weekdays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sab', 'Dom'];
	const hoursRangePerDay = { start: 8, end: 19 };
	const totalHours = hoursRangePerDay.end - hoursRangePerDay.start;
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
	const eventList = $derived(lista_filtrada);
	const weekDates = $derived(getWeekDates(calendarStore.weekOffset));
	const weekRangeText = $derived(formatWeekRange(weekDates));
	const weekEvents = $derived.by(() => {
		return eventList.filter((event) => {
			const eventDate = new Date(event.inicio);
			return weekDates.some((weekDate) => isSameDay(eventDate, weekDate));
		});
	});

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

		if (event.id_cliente) {
			await fetch('/oportunidades?/updateOp', { method: 'POST', body: formData });
		} else {
			await fetch('/actividades?/updateActivity', { method: 'POST', body: formData });
		}
		await invalidateAll();
	}

	function getEventsForSlot(hour: number, minute: number, targetDate: Date) {
		return weekEvents.filter((event) => {
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

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && expandedEventId) {
			expandedEventId = null;
		}
	}
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

<Vista>
	{#snippet acciones()}
		<div class="calendar-navigation">
			<button
				onclick={() => (calendarStore.weekOffset -= 1)}
				class="butter nav-btn"
				title="Semana anterior"
			>
				←
			</button>
			<button onclick={() => (calendarStore.weekOffset = 0)} class="butter current-week">
				{weekRangeText}
			</button>
			<button
				onclick={() => (calendarStore.weekOffset += 1)}
				class="butter nav-btn"
				title="Semana siguiente"
			>
				→
			</button>
		</div>
		<select
			value={$appState.calendarView}
			onchange={(e) => appState.setCalendarView(e.currentTarget.value)}
		>
			<option value="gant">Gant Anual</option>
			<option value="semanal">Semanal</option>
		</select>
		<select
			value={$appState.calendarList}
			onchange={(e) => appState.setCalendarList(e.currentTarget.value)}
		>
			<option value="" disabled>Todas</option>
			<option value="actividades">Actividades</option>
			<option value="oportunidades">Oportunidades</option>
		</select>
		<button onclick={() => appState.toggleMinimizedCalendarCards()} class="butter toggle">
			{$appState.calendarCards ? 'Min' : 'Max'}
		</button>
		<PanelFiltros>
			{#snippet header()}
				<button onclick={() => appState.toggleModalOp()} class="butter">+Oportunidad</button>
				<button onclick={() => appState.toggleModalActivity()} class="butter">+Actividad</button>
			{/snippet}
			{#snippet controles()}
				<ModList {columnasDinamicas} route={currentRoute} />
			{/snippet}
		</PanelFiltros>
	{/snippet}
	{#snippet contenido()}
		<div
			class="calendar"
			bind:clientHeight={calendarHeight}
			style="--dynamic-cell-height: {CELL_HEIGHT}px;"
		>
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

												<!-- svelte-ignore a11y_click_events_have_key_events -->
												<!-- svelte-ignore a11y_no_static_element_interactions -->
												<div
													class="event-wrapper panel"
													class:expanded={expandedEventId === event.id}
													onclick={(e) => {
														e.stopPropagation();
														expandedEventId = expandedEventId === event.id ? null : event.id;
													}}
													style="
													width: {expandedEventId === event.id ? 'auto' : 100 / totalConcurrentes + '%'};
													left: {expandedEventId === event.id ? 'auto' : (100 / totalConcurrentes) * index + '%'};
													height: {expandedEventId === event.id ? 'auto' : slots * CELL_HEIGHT + 'px'};
													min-height: var(--d);
													z-index: {expandedEventId === event.id ? 999 : 10 + index};
												"
												>
													{#if event.id.toLowerCase().includes('op')}
														<CSTarjetaOportunidad
															{event}
															style="height: 100%; width: 100%;"
															expanded={expandedEventId === event.id}
														/>
													{:else}
														<CSTarjetaActividad
															{event}
															style="height: 100%; width: 100%;"
															expanded={expandedEventId === event.id}
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
	{/snippet}
</Vista>

<style>
	.backdrop {
		position: fixed;
		inset: 0;
		cursor: pointer;
	}

	.calendar {
		flex-grow: 1;
		overflow: auto;
		display: flex;
		flex-direction: column;
		gap: 16px;
		border: 1px solid var(--color-muted);
		border-radius: var(--a);
		max-height: 88vh;
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
		z-index: 77;
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
	.event-cell:has(.expanded) {
		z-index: 9999;
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
			box-shadow 0.2s ease,
			z-index 0s;
		user-select: none;
		-webkit-user-select: none;
		-webkit-touch-callout: none;
		cursor: pointer;
	}

	.event-wrapper.expanded {
		position: fixed !important;
		top: 50% !important;
		left: 50% !important;
		transform: translate(-50%, -50%) !important;
		width: 70vw !important;
		max-width: 800px !important;
		min-height: var(--g) !important;
		max-height: var(--i) !important;
		height: 80vh !important;
		z-index: 9999 !important;
		box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
		margin: 0 !important;
		cursor: default;
	}

	.max {
		min-width: 70vw;
	}

	.current-week {
		text-align: center;
		flex-grow: 1;
	}

	.calendar-navigation {
		display: flex;
		gap: var(--a);
		flex-grow: 1;
		width: var(--h);
		align-self: flex-end;
	}
</style>
