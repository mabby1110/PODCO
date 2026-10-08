<script lang="ts">
	import { appState } from '$lib/stores/appState.svelte';
	import { slide } from 'svelte/transition';
	import { goto } from '$app/navigation';

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
	const navigate = (path: string) => {
		appState.togglePageActions();
		goto(path);
	};
</script>

<svelte:window onkeydown={handleKeyDown} />

<div class="nav-container">
	{#if expanded}
		<div class="nav-links panel" in:slide>
			<!-- {#if show}
			<PanelNotificaciones />
			{:else}
			{/if} -->
			<button onclick={() => navigate('/clientes')} class="butter milk"> 👨‍💼 Clientes </button>
			<button onclick={() => navigate('/oportunidades')} class="butter milk">
				📋 Oportunidades
			</button>
			<button onclick={() => navigate('/actividades')} class="butter milk"> ⚡ Actividades </button>
			<button onclick={() => navigate('/calendario')} class="butter milk"> 📆 Calendario </button>
			<button onclick={() => navigate('/pedidos')} class="butter milk"> 📦 Pedidos </button>
			<button onclick={() => navigate('/inventario')} class="butter milk"> 🗄 Inventario </button>
			<button onclick={() => navigate('/catalogo')} class="butter milk"> 📑 Catalogo </button>
			<!-- <button onclick={() => navigate('/pedidos')} class="butter">
				🛒 Pedidos
				</button> -->
			<!-- <button onclick={() => navigate('/estadisticas')} class="butter"> 📊 Estadisticas </button> -->
		</div>
	{/if}
	<button onclick={togglePanel} class="home honey">
		<img src="/bms-logo.svg" alt="BMS" />
	</button>
</div>

<style>
	.nav-container {
		z-index: 1000;
		display: flex;
		flex-direction: column;
		max-width: 100vw;
		align-items: flex-end;
	}
	.nav-links {
		display: flex;
		flex-direction: column;
		min-width: var(--g);
		position: absolute;
		bottom: var(--e);
		padding: var(--y) var(--a);
	}
</style>
