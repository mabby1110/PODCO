<script lang="ts">
    import { enhance } from '$app/forms';
    import { invalidateAll } from '$app/navigation';
    import { appState } from '$lib/stores/appState.svelte';
    import { opModalStore } from '$lib/stores/opModalStore.svelte';
    import FormOportunidad from './FormOportunidad.svelte';

    let canSubmit = $state(false);

    function closeAndClear() {
        appState.toggleModalOp();
        opModalStore.clearStore();
    }
</script>

{#if $appState.ModalOp}
    <div
        class="overlay honey"
        role="button"
        tabindex="0"
        onkeydown={(e) => e.key === 'Escape' && closeAndClear()}
    >
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <div class="modal" onclick={(e) => e.stopPropagation()} role="dialog" tabindex="-1">
            <div class="modal-header">
                <h1>Nueva Oportunidad</h1>
                <button class="jelly rojo" onclick={closeAndClear}>✕</button>
            </div>
            <form
                method="POST"
                action="/oportunidades?/add"
                use:enhance={() => {
                    return async ({ result, update }) => {
                        if (result.type === 'success' && result.data?.op) {
                            if (opModalStore.onSuccess) {
                                opModalStore.onSuccess(result.data.op);
                            }

                            closeAndClear();
                            invalidateAll();
                            await update({ reset: true });
                        }
                    };
                }}
            >
                <FormOportunidad bind:isValid={canSubmit} />

                <div class="actions">
                    <button class="butter success" type="submit" disabled={!canSubmit}>Agregar</button>
                </div>
            </form>
        </div>
    </div>
{/if}

<style>
    .actions {
        display: flex;
        gap: 0.5rem;
        justify-content: flex-end;
        padding-top: 1rem;
    }
    .butter:hover:not(:disabled) {
        transform: translateY(-2px);
    }
    .butter:active:not(:disabled) {
        transform: translateY(0);
    }
    .butter:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
</style>