<script lang="ts">
	import { slide } from 'svelte/transition';
	
	import CalendarWeek from '$lib/components/Views/CalendarWeek.svelte';

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
			<CardActividad />
		{:else}
			<section in:slide>
				<CalendarWeek events={allActivities} />
			</section>
		{/if}
</div>

<style>
	.page-content {
		display: flex;
		flex-direction: column;
		overflow: auto;
	}
	section {
		flex-grow: 1;
		overflow: auto;
		display: flex;
		flex-direction: column;
		min-height: var(--h);
	}
	.selected {
		max-height: 90vh;
		height: 100%;
	}
</style>
