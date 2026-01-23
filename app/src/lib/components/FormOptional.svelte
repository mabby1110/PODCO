<script lang="ts">
    import type { Snippet } from 'svelte';
    import { slide } from 'svelte/transition';
    let {
        children,
        submitType = $bindable(),
        buttonText = 'Mostrar',
    }: {
        children?: Snippet;
        buttonText?: string;
        submitType: boolean;
    } = $props();
    let isOpen = $state(false);
    function toggle() {
        isOpen = !isOpen;
        submitType = !submitType;
    }
</script>
<div class="optional">
    {#if !isOpen}
        <button class="butter" type="button" onclick={toggle}>
            {buttonText}
        </button>
    {:else}
        <div class="content-wrapper" transition:slide>
            <button class="close-btn" type="button" onclick={toggle}>✕</button>
            <div class="content">
                {@render children?.()}
            </div>
        </div>
    {/if}
</div>
<style>
    .optional {
        width: 100%;
    }
    .content-wrapper {
        position: relative;
        width: 100%;
    }
    .close-btn {
        position: absolute;
        top: 0.5rem;
        right: 0.5rem;
        background: none;
        border: none;
        cursor: pointer;
        width: 2rem;
        height: 2rem;
        border-radius: 4px;
        font-size: 1.25rem;
        color: #666;
        transition: all 0.2s;
    }
    .close-btn:hover {
        background: #f3f4f6;
        color: #000;
    }
    .content {
        margin-top: 1.5rem;
    }
</style>