<script lang="ts">
    import { slide } from 'svelte/transition';
    import CalendarWeek from '$lib/components/CalendarWeek.svelte';
    import CardOportunidad from '$lib/components/Oportunidad/CardOportunidad.svelte';
    import { selectedOp } from '$lib/stores/selectedOp.js';
    import { selectedActivity } from '$lib/stores/selectedActivity.js';
    import CardActividad from '$lib/components/Actividad/CardActividad.svelte';
    import { filtrarConsecutivo } from '$lib/utils/util.js';
    import { filterStore } from '$lib/stores/filterStore.svelte.js';

    let { data } = $props();
    let allActivities = $derived(data.oportunidades.concat(data.actividades));
    const events = $derived(
        filterStore.atributo !== ''
            ? filtrarConsecutivo(filterStore.atributo, 'id_agente', allActivities)
            : allActivities
    );

    function handleKeydown(event: KeyboardEvent) {
        if (event.key === 'Escape') {
            if ($selectedOp) selectedOp.clear();
            if ($selectedActivity) selectedActivity.clear();
        }
    }
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="page-content">
    {#if $selectedOp}
        <section class="selected" in:slide>
            <CardOportunidad />
        </section>
    {:else if $selectedActivity}
        <section>
            <CardActividad />
        </section>
    {:else}
        <section class="calendar-container" in:slide>
            <CalendarWeek {events} />
        </section>
    {/if}
</div>

<style>
	.calendar-container {
		height: 100%;
	}
</style>
