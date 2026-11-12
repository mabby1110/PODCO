<script lang="ts">
    import { StoreHotkeys } from '$lib/stores/StoreHotkeys.svelte';
    import { onMount } from 'svelte';
    import type { Snippet } from 'svelte';
    let {
        acciones,
        header,
        absolute,
        show = $bindable(false)
    }: {
        acciones?: Snippet;
        header?: Snippet;
        absolute?: boolean;
        show?: boolean;
    } = $props();

    let isMaximized = $state(false);

    let x = $state(0);
    let y = $state(0);
    let isDragging = $state(false); // Cambiado a $state para usarlo en clases dinámicas

    let startX = 0;
    let startY = 0;
    let initialX = 0;
    let initialY = 0;

    let panel: HTMLDivElement | undefined = $state();
    let quadrantY = $state('top');
    let quadrantX = $state('left');

    function calculateQuadrant() {
        if (!panel) return;
        const rect = panel.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        quadrantX = centerX > window.innerWidth / 2 ? 'right' : 'left';
        quadrantY = centerY > window.innerHeight / 2 ? 'bottom' : 'top';
    }

    function onMouseDown(event: MouseEvent) {
        // Solo permitir arrastre si no está maximizado Y si se usa el botón central (botón 1)
        if (isMaximized || event.button !== 1) return;
        
        // Evita el comportamiento de auto-scroll por defecto del navegador en Windows/Linux
        event.preventDefault(); 
        
        isDragging = true;
        startX = event.clientX;
        startY = event.clientY;
        initialX = x;
        initialY = y;
    }

    function onMouseMove(event: MouseEvent) {
        if (!isDragging) return;
        // Restaurados los signos '-' que faltaban en el cálculo
        x = initialX + (event.clientX - startX);
        y = initialY + (event.clientY - startY);
        calculateQuadrant();
    }

    function onMouseUp() {
        if (isDragging) {
            isDragging = false;
            calculateQuadrant();
        }
    }

    function resetPosition(event: MouseEvent) {
        event.stopPropagation();
        x = 0;
        y = 0;
        isMaximized = false;
        setTimeout(calculateQuadrant, 0);
    }

    $effect(() => {
        if (show) {
            setTimeout(calculateQuadrant, 0);
        }
    });
    
    onMount(() => {
        window.addEventListener('resize', calculateQuadrant);

        const unregisterHotkey = StoreHotkeys.register({
            id: 'panel-controls',
            key: 'q',
            label: 'Abrir/cerrar panel de opciones',
            action: () => {
                show = !show;
            }
        });

        const unregisterEscape = StoreHotkeys.registerEscape('panel-controls', () => {
            if (show) show = false;
        });

        return () => {
            window.removeEventListener('resize', calculateQuadrant);
            unregisterHotkey();
            unregisterEscape();
        };
    });
</script>

<svelte:window onmousemove={onMouseMove} onmouseup={onMouseUp} />

{#if show}
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <!-- Evento mousedown movido a todo el panel y control dinámico del cursor -->
    <div
        bind:this={panel}
        class="honey {absolute ? 'panel-controls-local' : 'panel-controls'} {isMaximized ? 'maximized' : ''} {isDragging ? 'dragging' : ''}"
        style={isMaximized ? '' : `transform: translate(${x}px, ${y}px);`}
        onmousedown={onMouseDown}
    >
        <div class="contenido">
            {#if acciones}
                {@render acciones()}
            {/if}
        </div>

        <!-- Se quitó onmousedown de aquí -->
        <div class="header-actions">
            {#if header}
                <div class="custom">
                    {@render header()}
                </div>
            {/if}
            <div class="default">
                <button class="jelly" type="button" onclick={resetPosition}>◥</button>
                <button class="butter rojo" type="button" onclick={() => (show = false)}>✕</button>
            </div>
        </div>
    </div>
{/if}

<button class="control honey" class:activo={show} onclick={() => (show = !show)}>
    <img src="/options.svg" alt="options" />
    {#if StoreHotkeys.active && StoreHotkeys.get('q')}
        <span class="hotkey-badge">
            {StoreHotkeys.get('q')?.key.toUpperCase()}
        </span>
    {/if}
</button>

<style>
    .panel-controls {
        position: fixed;
        bottom: var(--f);
        right: var(--a);
        max-width: var(--i);
        width: 96vw;
        height: fit-content;
        max-height: 60%;
        min-height: var(--g);
        display: flex;
        gap: var(--a);
        flex-direction: column-reverse;
    }

    /* Regla añadida para mostrar el cursor agarrando cuando movemos */
    .dragging {
        cursor: grabbing !important;
        user-select: none;
    }

    .header-actions {
        width: 100%;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        flex-flow: row;
        gap: var(--a);
        padding: var(--a) var(--a) 4px;
        /* Se removieron los cursores y el user-select de aquí, ya que el header ya no dispara esto solo */
    }

    .header-actions .custom {
        flex-grow: 1;
        display: flex;
        gap: var(--a);
        max-height: var(--d);
    }
    
    .header-actions .default {
        display: flex;
        gap: var(--a);
    }
    
    .contenido {
        flex-grow: 1;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        padding: var(--a);
        gap: var(--a);
    }
    
    .maximized {
        position: fixed !important;
        top: 0 !important;
        width: 100% !important;
        height: 100% !important;
        max-height: 88dvh !important;
        max-width: 100dvw !important;
        z-index: 9999;
        min-height: var(--g);
    }

    .control {
        position: relative;
        padding: var(--y);
        height: var(--d);
    }

    .panel-controls-local {
        position: sticky;
        top: 0;
        right: 0;
        max-width: 40vw;
        display: flex;
        flex-wrap: wrap;
        gap: var(--a);
    }
</style>