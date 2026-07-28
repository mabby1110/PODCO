<script lang="ts">
	import { appState } from "$lib/stores/appState.svelte";
	import PanelNotificaciones from "$lib/components/Notificaciones/PanelNotificaciones.svelte";
	import Logout from "./Logout.svelte";
	import ControlsPanel from "$lib/components/Panel/ControlsPanel.svelte";
	import { slide } from "svelte/transition";

	let expanded = $derived($appState.pageActions);
	let show = $state(false);
	function togglePanel(e: MouseEvent) {
		e.stopPropagation();
		e.preventDefault();
		appState.togglePageActions();
		show = false;
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.altKey && event.key === '1') {
			event.preventDefault(); // Evita el comportamiento por defecto del navegador
			expanded = !expanded;
		}
		if (event.key === 'Escape') {
			expanded = false;
		}
	}
</script>

<svelte:window onkeydown={handleKeyDown} />

<div class="nav-container">
	{#if expanded}
		<div class="app-actions" in:slide>
			<Logout />
			<button class="butter honey  {show ? 'active' : ''}" onclick={() => (show = !show)}>
				<img src="/notifications.svg" alt="options" />
			</button>
			<div class="content">
				{#if show}
					<PanelNotificaciones />
				{:else}
					<ControlsPanel />
				{/if}
			</div>
		</div>
	{/if}
	<button onclick={togglePanel} class="home {expanded ? 'active' : ''}">
		<div class="logo">
			<img src="/bms-logo.svg" alt="BMS" />
			{#if expanded}
				<div class="title" in:slide={{ axis: 'x' }}>
					<p>COMPONENTES Y EQUIPOS</p>
					<p>INDUSTRIALES</p>
				</div>
			{/if}
		</div>
	</button>
</div>

<style>
	.nav-container {
		position: fixed;
		bottom: 0;
		left: 0;
		z-index: 1000;
		display: flex;
		flex-wrap: wrap;
		gap: var(--a);
		width: var(--h);
		max-width: 100vw;
	}
	.app-actions {
		width: 100%;
		display: flex;
		gap: var(--a);
		align-items: flex-end;
		justify-content: space-between;
		flex-wrap: wrap;
		max-height: 90vh;
	}
	.app-actions .content {
		width: 100%;
		height: 100%;
		max-height: 80vh;
	}
	.home {
		background: var(--y2k);
		backdrop-filter: blur(4px);
		border: 1px solid var(--color-muted);
		border-radius: var(--a);
		cursor: pointer;
		user-select: none;
		padding: 4px var(--a);
		transition:
			background-color 0.2s,
			transform 0.1s;
		box-shadow: none;
		background-color: var(--color-primary);
		border-radius: 0 var(--a) 0 0;
	}

	.logo {
		display: flex;
		align-items: center;
		gap: var(--b);
	}

	.logo img {
		pointer-events: none;
		height: 30px;
	}

	.title {
		white-space: nowrap;
	}

	.title p {
		margin: 0;
		font-weight: 600;
	}
	.active {
		width: 100%;
	}
</style>
