<script lang="ts">
	import CalendarioAnual from '$lib/components/Vistas/Calendario/CalendarioAnual.svelte';
	import CalendarioSemanal from '$lib/components/Vistas/Calendario/CalendarioSemanal.svelte';
	import { appState } from '$lib/stores/appState.svelte';
</script>
{#if $appState.calendarView == 'gant'}
	<CalendarioAnual />
{:else}
	<CalendarioSemanal />
{/if}
