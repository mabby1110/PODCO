<script lang="ts">
	import { onNavigate } from '$app/navigation';
	import { selectedGroupStore } from '$lib/stores/groupFilter.svelte.js';
	import { profile } from '$lib/stores/profileStore.svelte.js';
	import NavButton from '$lib/components/Acciones/NavButton.svelte';
	import ModalActividad from '$lib/components/Vistas/Actividad/ModalActividad.svelte';
	import ModalOportunidad from '$lib/components/Vistas/Oportunidad/ModalOportunidad.svelte';
	import ModalCliente from '$lib/components/Vistas/Cliente/ModalCliente.svelte';
	import ModalInventario from '$lib/components/Vistas/Inventario/ModalInventario.svelte';
	import ModalProducto from '$lib/components/Vistas/Catalogo/ModalProducto.svelte';
	import ModalPedidoEditar from '$lib/components/Vistas/Pedidos/ModalPedidoEditar.svelte';
	import Logout from '$lib/components/Acciones/Logout.svelte';
	import { page } from '$app/state';
	import { appState } from '$lib/stores/appState.svelte.js';
	import { slide } from 'svelte/transition';

	let { children, data } = $props();

	function handleKeyDown(event: KeyboardEvent) {
		if (event.altKey && event.key === 'q') {
			event.preventDefault();
			window.history.back();
		}
		if (event.altKey && event.key === 'w') {
			event.preventDefault();
			window.history.forward();
		}
	}

	onNavigate((navigation) => {
		if (!document.startViewTransition) return;

		selectedGroupStore.clearAll();

		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});

	$effect(() => {
		profile.set(data.profile);
	});
</script>

<svelte:window onkeydown={handleKeyDown} />
<div class="layout">
	<!-- {#if expanded}
		<div class="meta-layout" transition:slide>
			<Logout />
			<p>{page.url.pathname}</p>
		</div>
	{/if} -->
	
	{@render children()}
</div>

<ModalActividad />
<ModalOportunidad />
<ModalCliente />
<ModalInventario />
<ModalProducto />
<ModalPedidoEditar />

<style>
	.layout {
		height: 100vh;
		display: flex;
		flex-direction: column;
	}
	.meta-layout {
		display: flex;
		padding: var(--a);
		align-items: baseline;
		gap: var(--a);
	}
</style>
