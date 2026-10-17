<script lang="ts">
    import { dropzone } from '$lib/actions/dnd';
    import { calendarStore } from '$lib/stores/calendarStore.svelte';
    import { appState } from '$lib/stores/appState.svelte';
    import { invalidateAll } from '$app/navigation';
    import {
        isSameDay,
        formatDate,
        formatDateTime,
        calculateDuration,
        getMonth
    } from '$lib/utils/agenda';
    import { page } from '$app/state';
    import CSTarjetaActividad from './CSTarjetaActividad.svelte';
    import CSTarjetaOportunidad from './CSTarjetaOportunidad.svelte';
    import { filterData, sortData } from '$lib/utils/ModList';

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

    const CELL_HEIGHT = $derived($appState.calendarCards
            ? 180
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
</script>

<svelte:window onkeydown={handleKeydown} />

{#if expandedEventId}
    <div
        class="backdrop"
        onclick={(e) => {
            e.stopPropagation();
            expandedEventId = null;
        }}
    ></div>
{/if}
<div
    class="calendar"
    style="--dynamic-cell-height: {CELL_HEIGHT}px; --cols: 7; --rows: {rowsCount};"
>
    <h1 class="month-title">{getMonth(monthDate)}</h1>

    <div
        class="calendar-grid-container"
        class:max={$appState.calendarCards}
        bind:clientHeight={containerHeight}
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
                    class:today={isSameDay(date, new Date())}
                    use:dropzone={{
                        on_dropzone: (eventId: string) => handleDrop(eventId, date)
                    }}
                >
                    <div class="date-label">{formatDate(date)}</div>
                    <div class="event-stack">
                        {#each eventosDia as event (event.id)}
                            {@const isExpanded = expandedEventId === event.id}
                            <!-- svelte-ignore a11y_click_events_have_key_events -->
                            <!-- svelte-ignore a11y_no_static_element_interactions -->
                            <div
                                class="event-wrapper honey"
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
    .backdrop {
        position: fixed;
        inset: 0;
        cursor: pointer;
    }
    .calendar {
        display: flex;
        flex-direction: column;
        height: 100%;
        min-height: var(--i);
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
        background: var(--bg-color, transparent);
        z-index: 10;
        flex-shrink: 0;
    }
    .calendar-grid-container {
        flex: 1 1 0;
        min-height: 0;
        overflow-x: hidden;
        overflow-y: hidden;
        position: relative;
    }
    .calendar-grid-container.max {
        overflow-y: auto;
    }
    .calendar-grid {
        display: grid;
        grid-template-columns: repeat(var(--cols), minmax(0, 1fr));
        grid-template-rows: auto repeat(var(--rows), var(--dynamic-cell-height));
        min-width: 100%;
        gap: 0;
    }
    .day-th {
        position: sticky;
        top: 0;
        z-index: 11;
        padding: 8px;
        background: transparent;
        border-radius: 8px;
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
        padding: 2px 4px;
        flex-shrink: 0;
    }
    .event-cell {
        position: relative;
        display: flex;
        flex-direction: column;
        min-width: 0;
        min-height: 0;
        height: var(--dynamic-cell-height);
        overflow: hidden;
        border-radius: 8px;
        border-right: 1px solid var(--color-muted);
        border-bottom: 1px solid var(--color-muted);
    }
    .event-cell.outside {
        opacity: 0.5;
    }
    .event-cell.today .date-label {
        opacity: 1;
        font-weight: bold;
    }
    .event-cell:has(.expanded) {
        overflow: visible;
        z-index: 9999;
    }
    .event-stack {
        display: flex;
        flex-direction: column;
        gap: 2px;
        flex: 1 1 0;
        min-height: 0;
        overflow-y: auto;
        border-radius: inherit;
    }
    .event-cell:has(.expanded) .event-stack {
        overflow: visible;
    }
    .event-wrapper {
        position: relative;
        flex-shrink: 0;
        width: 100%;
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