<script lang="ts">
	import ModalActividad from '$lib/components/Actividad/ModalActividad.svelte';
	import ModalCliente from '$lib/components/Cliente/ModalCliente.svelte';
	import ModalOportunidad from '$lib/components/Oportunidad/ModalOportunidad.svelte';
	import NavButton from '$lib/components/NavButton.svelte';
	import { profile } from '$lib/stores/profileStore.svelte.js';

	let { children, data } = $props();
	import { onNavigate } from '$app/navigation';
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

<ModalActividad />
<ModalOportunidad />
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
