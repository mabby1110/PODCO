<script lang="ts">
	import { slide } from 'svelte/transition';

	import CalendarWeek from '$lib/components/CalendarWeek.svelte';

	import CardOportunidad from '$lib/components/Oportunidad/CardOportunidad.svelte';

	import { selectedOp } from '$lib/stores/selectedOp.js';
	import { selectedActivity } from '$lib/stores/selectedActivity.js';
	import CardActividad from '$lib/components/Actividad/CardActividad.svelte';

	let { data } = $props();

	let allActivities = $derived(data.oportunidades.concat(data.actividades));
</script>

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
			<CalendarWeek events={allActivities} />
		</section>
	{/if}
</div>

<style>
	.calendar-container {
		height: 100%;
	}
</style>
