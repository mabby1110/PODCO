
<script lang="ts">
    import { StoreAplicacion } from '$lib/stores/app/StoreAplicacion.svelte';
    import { StoreHotkeys } from '$lib/stores/app/StoreHotkeys.svelte';
    import { onMount } from 'svelte';

    let {
        key = 'q',
        id_store = 'controles',
        children,
        onclick
    }: {
        key?: string;
        id_store: keyof typeof StoreAplicacion.value;
        children: any;
        onclick?: (e: MouseEvent | KeyboardEvent) => boolean | void;
    } = $props();

    function handleClick(e: MouseEvent | KeyboardEvent) {
        const manejado = onclick?.(e);

        if (manejado === false || !onclick) {
            StoreAplicacion.toggle(id_store);
        }
    }

    // Registrar Escape únicamente cuando el modal está abierto.
    $effect(() => {
        if (!StoreAplicacion.value[id_store]) return;

        return StoreHotkeys.registerEscape(
            id_store,
            () => {
                StoreAplicacion.set(id_store, false);
            }
        );
    });

    // Registrar el comando durante la vida del componente.
    onMount(() => {
        const unregisterHotkey = StoreHotkeys.register({
            id: `hotbutton-${String(id_store)}`,
            key,
            label: `Abrir/cerrar ${String(id_store)}`,
            action: () => handleClick(new KeyboardEvent('keydown'))
        });

        return unregisterHotkey;
    });
</script>

<button
    class:activo={StoreAplicacion.value[id_store]}
    class="honey accion"
    onclick={handleClick}
>
    {#if StoreHotkeys.active && StoreHotkeys.get(key)}
        <span class="hotkey-badge">
            {StoreHotkeys.get(key)?.key.toUpperCase()}
        </span>
    {/if}

    {#if children}
        {@render children()}
    {/if}
</button>
