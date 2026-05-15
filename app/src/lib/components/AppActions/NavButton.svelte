<script lang="ts">
	import { slide } from 'svelte/transition';
	import { appState } from '$lib/stores/appState.svelte';
	import ControlsPanel from '../ControlsPanel.svelte';
	import Logout from '../Logout.svelte';

	let expanded = $derived($appState.pageActions);

	function togglePanel(e: MouseEvent) {
		e.stopPropagation();
		e.preventDefault();
		appState.togglePageActions();
	}
</script>

<div class="nav-container">
	{#if expanded}
		<Logout />
		<ControlsPanel />
	{/if}

	<button onclick={togglePanel} class="butter">
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
		bottom: var(--a);
		left: var(--a);
		z-index: 1000;
		display: flex;
		flex-direction: column;
		gap: var(--a);
		width: fit-content;
		flex-wrap: wrap;
	}

	button {
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
</style>
