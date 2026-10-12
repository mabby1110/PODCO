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
		<div class="nav-links honey" in:slide>
			<!-- {#if show}
			<PanelNotificaciones />
			{:else}
			{/if} -->
			<button onclick={() => navigate('/clientes')} class="jelly"> Clientes 👨‍💼 </button>
			<button onclick={() => navigate('/oportunidades')} class="jelly"> Oportunidades 📋 </button>
			<button onclick={() => navigate('/actividades')} class="jelly"> Actividades ⚡ </button>
			<button onclick={() => navigate('/calendario')} class="jelly"> Calendario 📆 </button>
			<button onclick={() => navigate('/pedidos')} class="jelly"> Pedidos 📦 </button>
			<button onclick={() => navigate('/inventario')} class="jelly"> Inventario 🗄 </button>
			<button onclick={() => navigate('/catalogo')} class="jelly"> Catalogo 📑 </button>
			<!-- <button onclick={() => navigate('/pedidos')} class="butter">
				🛒 Pedidos
				</button> -->
			<!-- <button onclick={() => navigate('/estadisticas')} class="butter"> 📊 Estadisticas </button> -->
		</div>
	{/if}
	<button onclick={togglePanel} class="home butter" class:activo={expanded}>
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
		position: absolute;
		bottom: var(--f);
		padding: var(--b);
		gap: var(--a);
	}
	.nav-links button {
		display: flex;
		justify-content: flex-end;
		padding: var(--a);
		min-width: var(--g);
	}
	.nav-links button:hover{
		background-color: var(--color-button-highlight);
	}
	.home {
		padding: var(--y);
		height: var(--e);
	}
</style>
