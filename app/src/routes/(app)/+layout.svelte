<script lang="ts">
	import ModalActividad from '$lib/components/Actividad/ModalActividad.svelte';
	import ModalCliente from '$lib/components/Cliente/ModalCliente.svelte';
	import ModalOportunidad from '$lib/components/Oportunidad/ModalOportunidad.svelte';
	import NavButton from '$lib/components/NavButton.svelte';
	import { profile } from '$lib/stores/profileStore.svelte.js';

	let { children, data } = $props();
	import { beforeNavigate, onNavigate } from '$app/navigation';
	import { selectedGroupStore } from '$lib/stores/groupFilter.svelte.js';
	import { globalFilterStore } from '$lib/stores/globalFilterStore.svelte.js';

	onNavigate((navigation) => {
		// Verificamos si el navegador soporta esta tecnología (Safari 18+, Chrome, Edge)
		if (!document.startViewTransition) return;

		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});
	beforeNavigate(({ from, to }) => {
		// Evitar ejecución en la carga inicial
		if (!from || !to) return;

		// Extraer el segmento principal de la ruta (ej. 'oportunidades' de '/oportunidades/123')
		const fromBase = from.url.pathname.split('/')[1];
		const toBase = to.url.pathname.split('/')[1];

		// Limpiar el store solo si el segmento principal cambia
		if (fromBase !== toBase) {
			selectedGroupStore.clearGroup();
			globalFilterStore.clearFilters();
		}
	});
	$effect(() => {
		profile.set(data.profile);
	});
</script>

<nav class="nav-container">
	<NavButton />
</nav>

<div class="page-container">
	{@render children()}
</div>

<ModalActividad {data} />
<ModalOportunidad {data} />
<ModalCliente {data} />

<style>
	.nav-container {
		position: fixed;
		left: var(--a);
		top: 0;
		z-index: 999;
	}
	/* .page-container {
		background-image: url('bombas.svg');
	} */
</style>
