<script lang="ts">
    import bms from '$lib/assets/bms-logo.svg';
    import '$lib/global.css';
    import { profile } from '$lib/stores/profileStore.svelte.js';
    import { onMount } from 'svelte';

    let { children, data } = $props();

    // Cargar profile en el store cuando el componente se monta
    onMount(() => {
        profile.set(data.profile);
    });

    // Actualizar cuando data.profile cambie
    $effect(() => {
        profile.set(data.profile);
    });
</script>

<svelte:head>
    <link rel="icon" href={bms} />
</svelte:head>

{@render children()}