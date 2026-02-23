<script lang="ts">
	import { appState } from '$lib/stores/appState.svelte';
	import { selectedOp } from '$lib/stores/selectedOp';
	import { slide } from 'svelte/transition';
	import { viewState } from '$lib/stores/ViewState';
</script>

<div class="container" in:slide={{ delay: 300, duration: 300 }}>
	<div class="button-group">
		<button
			onclick={() => {
				viewState.setCalendar();
				appState.togglePageActions();
				$selectedOp = null;
			}}
			class="butter"
			style={$viewState.calendar ? 'background-color: var(--color-highlight);' : ''}
		>
			📅 Calendario
		</button>
		<button
			onclick={() => {
				viewState.setOp();
				appState.togglePageActions();
				$selectedOp = null;
			}}
			class="butter"
			style={$viewState.op ? 'background-color: var(--color-highlight);' : ''}
		>
			📋 Oportunidades
		</button>
		<button
			onclick={() => {
				viewState.setClients();
				appState.togglePageActions();
				$selectedOp = null;
			}}
			class="butter"
			style={$viewState.clients ? 'background-color: var(--color-highlight);' : ''}
		>
			🐄 Clientes
		</button>
		<button
			onclick={() => {
				viewState.setActivities();
				appState.togglePageActions();
				$selectedOp = null;
			}}
			class="butter"
			style={$viewState.activities ? 'background-color: var(--color-highlight);' : ''}
		>
		⚡ Actividades
		</button>
	</div>

	<div class="separator"></div>

	<div class="button-group">
		<button onclick={() => appState.toggleModalActivity()} class="butter">+Actividad</button>
		<button onclick={() => appState.toggleModalOp()} class="butter">+Oportunidad</button>
		<button onclick={() => appState.toggleModalClient()} class="butter">+Cliente</button>
	</div>
</div>

<style>
	.container {
		background: var(--color-contrast);
		backdrop-filter: blur(4px);
		border: 1px solid var(--color-muted);
		border-radius: var(--a);
		padding: var(--a);
		display: flex;
		flex-direction: column;
		gap: var(--a);
	}

	.button-group {
		display: flex;
		flex-wrap: wrap;
		gap: var(--a);
		justify-content: flex-end;
	}

	.separator {
		height: 1px;
		background: var(--color-muted);
		margin: 0;
		align-self: stretch;
	}
</style>
