<script lang="ts">
	import { onNavigate } from '$app/navigation';
	import NavButton from '$lib/components/Acciones/NavButton.svelte';import { selectedGroupStore } from '$lib/stores/groupFilter.svelte.js';
	import { profile } from '$lib/stores/profileStore.svelte.js';

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

<NavButton />

{@render children()}

<!-- <ModalActividad />
<ModalOportunidad />
<ModalCliente />
<ModalInventario /> -->

<style>
	/* .page-container {
        background-image: url('bombas.svg');
    } */
</style>
