<script lang="ts">
    import type { Snippet } from 'svelte';
    import { slide } from 'svelte/transition';
    let {
        children,
        submitUpdate = $bindable(),
        submitCancel = $bindable(),
    }: {
        children?: Snippet;
        submitUpdate: boolean;
        submitCancel: boolean;
    } = $props();
    let isOpen = $state(false);
    function toggleUpdate() {
        submitUpdate = true;
        submitCancel = false;
        isOpen = true;
    }
    function toggleCancel() {
        submitCancel = true;
        submitUpdate = false;
        isOpen = true;
    }
    function close() {
        isOpen = false;
        submitUpdate = false;
        submitCancel = false;
    }
    $effect(()=>console.log(submitCancel, submitUpdate, isOpen))
</script>
<div class="optional">
    {#if !isOpen}
        <button class="butter" type="button" onclick={toggleUpdate}>
            Postergar
        </button>
        <button class="butter" type="button" onclick={toggleCancel}>
            Perder
        </button>
    {:else}
        <div class="content-wrapper">
            <button class="close-btn" type="button" onclick={close}>✕</button>
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