<script lang="ts">
    import { enhance } from '$app/forms';
    import { invalidateAll } from '$app/navigation';
    import type { Snippet } from 'svelte';

    let {
        action,
        isOpen = $bindable(false),
        onSuccess,
        fieldsContent,
        hiddenContent,
        submitContent
    }: {
        action: string;
        isOpen: boolean;
        onSuccess?: () => void;
        fieldsContent?: Snippet;
        hiddenContent?: Snippet;
        submitContent?: Snippet<[boolean]>;
    } = $props();

    let isSubmitting = $state(false);
    let actionsElement = $state<HTMLElement | null>(null);

    $effect(() => {
        if (isOpen && actionsElement) {
            actionsElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });

    function handleSubmit() {
        isSubmitting = true;
        return async ({ result, update }: any) => {
            isSubmitting = false;

            if (result.type === 'success') {
                isOpen = false;
                if (onSuccess) onSuccess();
                await update({ reset: true });
            }

            await invalidateAll();
        };
    }
</script>

<form method="POST" {action} enctype="multipart/form-data" use:enhance={handleSubmit}>
    {#if isOpen}
        <div class="actions" bind:this={actionsElement}>
            {#if fieldsContent}
                {@render fieldsContent()}
            {/if}
        </div>
    {/if}

    {#if hiddenContent}
        {@render hiddenContent()}
    {/if}

    {#if submitContent}
        {@render submitContent(isSubmitting)}
    {/if}
</form>