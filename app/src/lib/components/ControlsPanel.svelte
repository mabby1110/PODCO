<script lang="ts">
	import { appState } from '$lib/stores/appState.svelte';
	import { selectedActivity } from '$lib/stores/selectedActivity';
	import { selectedClient } from '$lib/stores/selectedClient';
	import { selectedOp } from '$lib/stores/selectedOp';
	import { slide } from 'svelte/transition';
	function handleNav() {
		selectedOp.clear();
		selectedClient.clear();
		selectedActivity.clear();
	}
</script>

<div class="container" in:slide={{ delay: 300, duration: 300 }}>
	<div class="button-group">
		<a
		href="/calendario"
			onclick={() => {
				handleNav();
				appState.togglePageActions();
				$selectedOp = null;
			}}
			class="butter"
		>
			📅 Calendario
		</a>
		<a
		href="/oportunidades"
			onclick={() => {
				handleNav();
				appState.togglePageActions();
				$selectedOp = null;
			}}
			class="butter"
		>
			📋 Oportunidades
		</a>
		<a
		href="/clientes"
			onclick={() => {
				handleNav();
				appState.togglePageActions();
				$selectedOp = null;
			}}
			class="butter"
		>
			🐄 Clientes
		</a>
		<a
		href="/actividades"
			onclick={() => {
				handleNav();
				appState.togglePageActions();
				$selectedOp = null;
			}}
			class="butter"
		>
		⚡ Actividades
		</a>
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
