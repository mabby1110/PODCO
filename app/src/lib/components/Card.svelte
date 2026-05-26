<script lang="ts">
    import type { Snippet } from 'svelte';
    import { slide } from 'svelte/transition';

    let {
        header,
        content,
        actions,
        headerStyle
    }: {
        header?: Snippet;
        content?: Snippet;
        actions?: Snippet;
        headerStyle?: string;
    } = $props();
</script>

<div class="card-full" transition:slide>
    {#if header}
        <header style={headerStyle}>
            {@render header()}
        </header>
    {/if}

    <div class="card-content">
        {#if content}
            {@render content()}
        {/if}

        {#if actions}
            <div class="card-actions">
                {@render actions()}
            </div>
        {/if}
    </div>
</div>

<style>
    .card-actions {
        height: 100%;
        flex-grow: 1;
    }
    .card-content {
		white-space: pre-wrap;
    }
</style>