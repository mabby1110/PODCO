<script lang="ts">
	import CalendarioAnual from '$lib/components/Calendario/CalendarioAnual.svelte';
	import CalendarioSemanal from '$lib/components/Calendario/CalendarioSemanal.svelte';
	import { appState } from '$lib/stores/appState.svelte';
</script>
{#if $appState.calendarView == 'gant'}
	<CalendarioAnual />
{:else if $appState.calendarView == 'semanal'}
	<CalendarioSemanal />
{/if}
