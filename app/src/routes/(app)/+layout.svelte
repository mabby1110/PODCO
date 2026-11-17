<script lang="ts">
	import { onNavigate } from '$app/navigation';
	import { profile } from '$lib/stores/profileStore.svelte.js';
	import ModalActividad from '$lib/components/Vistas/Actividad/ModalActividad.svelte';
	import ModalOportunidad from '$lib/components/Vistas/Oportunidad/ModalOportunidad.svelte';
	import ModalCliente from '$lib/components/Vistas/Cliente/ModalCliente.svelte';
	import ModalInventario from '$lib/components/Vistas/Inventario/ModalInventario.svelte';
	import ModalProducto from '$lib/components/Vistas/Catalogo/ModalProducto.svelte';
	import ModalEditarPedido from '$lib/components/Vistas/Pedidos/ModalEditarPedido.svelte';
	import Hotkeys from '$lib/components/Acciones/Hotkeys.svelte';
	import Logout from '$lib/components/Acciones/Logout.svelte';
	import ModalTipoProductoNuevo from '$lib/components/Vistas/Catalogo/ModalTipoProductoNuevo.svelte';
	import { StoreAplicacion } from '$lib/stores/app/StoreAplicacion.svelte.js';

	let { children, data } = $props();

	onNavigate((navigation) => {
		if (!document.startViewTransition) return;

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

<Hotkeys />

<div class="layout">
	<Logout />
	{@render children()}
</div>

<ModalOportunidad />
<ModalEditarPedido />
<ModalActividad />
<ModalCliente />
<ModalInventario />
<ModalProducto />
<ModalTipoProductoNuevo />

<style>
	.layout {
		height: 100vh;
		display: flex;
		flex-direction: column;
	}
</style>
