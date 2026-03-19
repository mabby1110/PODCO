<script lang="ts">
	import ActivityList from '$lib/components/Actividad/ActivityList.svelte';
	import { selectedActivity } from '$lib/stores/selectedActivity.js';
	import CardActividad from '$lib/components/Actividad/CardActividad.svelte';

	let { data } = $props();
</script>

<div class="page-content">
	{#if $selectedActivity}
		<section>
			<CardActividad />
		</section>
	{:else}
		<section>
			<ActivityList actividades={data.actividades} />
		</section>
	{/if}
</div>

<style>
	.page-content {
		display: flex;
		flex-direction: column;
		overflow: auto;
	}
</style>
