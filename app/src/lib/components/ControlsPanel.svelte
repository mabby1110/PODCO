<script lang="ts">
	import { appState } from '$lib/stores/appState.svelte';
	import { filterStore } from '$lib/stores/filterStore.svelte.js';
	import Filter from '$lib/components/Filter.svelte';
	import { selectedEvent } from '$lib/stores/selectedEvent';
	import { slide } from 'svelte/transition';
	import { viewState } from '$lib/stores/ViewState';
</script>

<div class="container" transition:slide={{ delay: 300, duration: 300 }}>
	<Filter />
	<button onclick={() => appState.toggleModalOp()} class="butter">+Oportunidad</button>
	<button onclick={() => appState.toggleModalClient()} class="butter">+Cliente</button>
	{#if !$viewState.calendar}
		<button
			onclick={() => {
				viewState.setCalendar();
				$selectedEvent = null;
			}}
			class="butter primary"
		>
			📅 Calendario
		</button>
	{/if}
	{#if !$viewState.list}
		<button
			onclick={() => {
				viewState.setList();
				$selectedEvent = null;
			}}
			class="butter primary"
		>
			📋 Lista
		</button>
	{/if}
	{#if !$viewState.resumen}
		<button
			onclick={() => {
				viewState.setResumen();
				$selectedEvent = null;
			}}
			class="butter primary"
		>
			⚡ Resumen
		</button>
	{/if}
</div>

<style>
	/* Panel de controles */
	.container {
		background: var(--color-contrast);
		backdrop-filter: blur(4px);
		border: 1px solid var(--color-muted);
		border-radius: var(--a);
		padding: var(--a);
		display: flex;
		flex-wrap: wrap;
		gap: var(--a);
		min-width: 300px;
	}

	.butter {
		font-weight: 500;
		white-space: nowrap;
	}
</style>
