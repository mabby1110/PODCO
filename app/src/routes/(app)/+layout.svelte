<script lang="ts">
    import { onNavigate } from '$app/navigation';
    import ModalActividad from '$lib/components/Actividad/ModalActividad.svelte';
    import ModalCliente from '$lib/components/Cliente/ModalCliente.svelte';
    import ModalOportunidad from '$lib/components/Oportunidad/ModalOportunidad.svelte';
    import ModalInventario from '$lib/components/Inventario/ModalInventario.svelte';
    import NavButton from '$lib/components/App/NavButton.svelte';
    import { profile } from '$lib/stores/profileStore.svelte.js';
    import { selectedGroupStore } from '$lib/stores/groupFilter.svelte.js';

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

<div class="page-container">
    {@render children()}
</div>

<ModalActividad />
<ModalOportunidad />
<ModalCliente />
<ModalInventario />

<style>
    /* .page-container {
        background-image: url('bombas.svg');
    } */
</style>