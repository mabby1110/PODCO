<script lang="ts">
    import { page } from '$app/state';
    import { onMount } from 'svelte';

    let {notificaciones} = $derived(page.data);
    let showFilter = $state(true);

    let x = $state(0);
    let y = $state(0);
    let isDragging = false;

    let startX = 0;
    let startY = 0;
    let initialX = 0;
    let initialY = 0;

    let panel: HTMLDivElement | undefined = $state();
    let quadrantY = $state('top');
    let quadrantX = $state('left');

    // Diccionario simple para que la acción sea legible
    const actionMap: Record<string, string> = {
        add: 'creó',
        update: 'actualizó',
        delete: 'eliminó',
        comment: 'comentó en'
    };

    function formatDate(dateString: string) {
        if (!dateString) return '';
        return new Date(dateString).toLocaleString(undefined, {
            year: 'numeric', month: 'short', day: 'numeric', 
            hour: '2-digit', minute: '2-digit'
        });
    }

    function calculateQuadrant() {
        if (!panel) return;
        const rect = panel.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        quadrantX = centerX > window.innerWidth / 2 ? 'right' : 'left';
        quadrantY = centerY > window.innerHeight / 2 ? 'bottom' : 'top';
    }

    function handleKeyDown(event: KeyboardEvent) {
        if (event.altKey && event.key === 's') {
            event.preventDefault();
            showFilter = !showFilter;
        }
        if (event.key === 'Escape') {
            showFilter = false;
        }
    }
    
    function onMouseDown(event: MouseEvent) {
        isDragging = true;
        startX = event.clientX;
        startY = event.clientY;
        initialX = x;
        initialY = y;
    }

    function onMouseMove(event: MouseEvent) {
        if (!isDragging) return;
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
        setTimeout(calculateQuadrant, 0);
    }

    $effect(() => {
        if (showFilter) {
            setTimeout(calculateQuadrant, 0);
        }
    });

    onMount(() => {
        window.addEventListener('resize', calculateQuadrant);
        return () => window.removeEventListener('resize', calculateQuadrant);
    });
</script>

<svelte:window onkeydown={handleKeyDown} onmousemove={onMouseMove} onmouseup={onMouseUp} />

{#if showFilter}
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
        bind:this={panel}
        class="{quadrantY} {quadrantX} panel-controls"
        style="transform: translate({x}px, {y}px);"
    >
        <div class="panel header-actions" onmousedown={onMouseDown}>
            <button class="close-btn" type="button" onclick={() => (showFilter = false)}>✕</button>
            <button class="butter" type="button" onclick={resetPosition}>Resetear posición</button>
        </div>
        
        <div class="panel content-actions notif-container">
            {#each notificaciones as notificacion (notificacion.id)}
                <div class="notif-card {notificacion.visto ? 'read' : 'unread'}">
                    
                    <div class="notif-header">
                        <strong>{notificacion.profiles.nombre}</strong> 
                        <span>{actionMap[notificacion.historial.accion] || notificacion.historial.accion}</span>
                        <span>un/a {notificacion.historial.tipo_objeto}</span>
                    </div>

                    <div class="notif-meta">
                        <small>{formatDate(notificacion.fecha_creacion)}</small>
                        {#if !notificacion.visto}
                            <span class="badge">Nueva</span>
                        {/if}
                    </div>

                    {#if notificacion.historial.cambios}
                        <details class="notif-details">
                            <summary>Ver datos</summary>
                            <pre><code>{JSON.stringify(notificacion.historial.cambios, null, 2)}</code></pre>
                        </details>
                    {/if}

                </div>
            {:else}
                <div class="empty-state">No hay notificaciones.</div>
            {/each}
        </div>
    </div>
{/if}
<button class="honey {showFilter?'active':''}" onclick={() => (showFilter = !showFilter)}>
    <img src="/notifications.svg" alt="options" />
</button>

<style>
    .panel-controls {
        position: fixed;
        top: 0;
        right: 0;
        right: var(--a, 1rem); /* Asignando un fallback a tu variable CSS */
        display: flex;
        gap: var(--a, 1rem);
        max-width: fit-content;
        z-index: 99;
    }
    
    .panel-controls.top,
    .panel-controls.bottom {
        flex-direction: column;
    }

    .header-actions {
        width: 100%;
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        gap: var(--a, 1rem);
        cursor: grab;
        user-select: none;
    }

    .header-actions:active {
        cursor: grabbing;
    }

    .header-actions.is-dragging > * {
        pointer-events: none;
    }

    /* Contenedor principal de notificaciones */
    .notif-container {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        max-height: 60vh;
        overflow-y: auto;
        min-width: 250px;
        max-width: 350px;
    }

    /* Tarjeta individual de notificación */
    .notif-card {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        border: 1px solid; /* Borde minimalista sin color forzado */
        padding: 0.75rem;
        border-radius: 4px;
        transition: opacity 0.2s;
    }

    /* Diferenciador visual entre leídas y no leídas (usando opacidad) */
    .notif-card.read {
        opacity: 0.5;
    }
    .notif-card.unread {
        opacity: 1;
    }

    .notif-header {
        display: flex;
        flex-wrap: wrap;
        gap: 0.25rem;
        line-height: 1.3;
    }

    .notif-meta {
        display: flex;
        justify-content: space-between;
        align-items: center;
        opacity: 0.8;
    }

    .badge {
        border: 1px solid;
        border-radius: 12px;
        padding: 0 0.4rem;
        font-size: 0.7em;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    /* Detalles colapsables para los cambios JSON */
    .notif-details {
        margin-top: 0.5rem;
        border-top: 1px dashed;
        padding-top: 0.5rem;
    }
    
    .notif-details summary {
        cursor: pointer;
        font-size: 0.85em;
        opacity: 0.8;
    }

    .notif-details pre {
        margin: 0.5rem 0 0 0;
        font-size: 0.75em;
        overflow-x: auto;
        padding: 0.5rem;
        border: 1px solid;
        opacity: 0.8;
    }

    .empty-state {
        padding: 1rem;
        text-align: center;
        opacity: 0.5;
    }
</style>