<script lang="ts">
    import { enhance } from '$app/forms';
    import { appState } from '$lib/stores/appState.svelte';
    import FormNewClient from './FormNewClient.svelte';
    import FormSelectAgente from '../FormSelectAgente.svelte';
    import { page } from '$app/state';

    let clientes = $derived(page.data.clientes ?? []);

    let selectedDataItem = $state(null);
    
    // Es recomendable que esta variable se llame 'busqueda' en lugar de 'razon_social' 
    // si ahora busca en varios campos, pero la mantengo igual para no romper tus bindings.
    let razon_social = $state(''); 
    
    let matches = $derived(
        razon_social.trim().length > 0
            ? (clientes?.filter((c: any) => {
                  const query = razon_social.toLowerCase().trim();
                  // Usamos ?. por si algún cliente no tiene uno de los dos campos
                  const matchRazon = c.razon_social?.toLowerCase().includes(query);
                  const matchNombre = c.nombre_comercial?.toLowerCase().includes(query);
                  
                  return matchRazon || matchNombre;
              }) ?? [])
            : []
    );

    let isDuplicate = $state(false);
</script>

{#if $appState.ModalClient}
    <div
        class="overlay"
        onclick={() => appState.toggleModalClient()}
        role="button"
        tabindex="0"
        onkeydown={(e) => e.key === 'Escape' && appState.toggleModalClient()}
    >
        <div class="modal" onclick={(e) => e.stopPropagation()} role="dialog" tabindex="-1">
            <div class="modal-header">
                <h2>Nuevo Cliente</h2>
                <button class="close" onclick={() => appState.toggleModalClient()}>✕</button>
            </div>
            <form
                method="POST"
                action="?/add"
                use:enhance={() => {
                    appState.toggleModalClient();
                    selectedDataItem = null;
                    alert('creado con exito!');
                }}
            >
                {#if matches.length > 0}
                    <ul class="matches">
                        {#each matches as match}
                            <li
                                class:exact={
                                    match.razon_social?.toLowerCase().trim() === razon_social.toLowerCase().trim() ||
                                    match.nombre_comercial?.toLowerCase().trim() === razon_social.toLowerCase().trim()
                                }
                            >
                                {match.razon_social} 
                                {#if match.nombre_comercial}
                                    <span class="text-gray-500 text-sm">({match.nombre_comercial})</span>
                                {/if}
                            </li>
                        {/each}
                    </ul>
                {/if}

                <FormSelectAgente />

                <FormNewClient bind:isDuplicate/>

                <div class="actions">
                    <button
                        class="butter {isDuplicate ? 'disabled' : 'success'}"
                        type="submit"
                        disabled={isDuplicate}>Agregar</button
                    >
                </div>
            </form>
        </div>
    </div>
{/if}
<style>
	.overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.5);
		backdrop-filter: blur(4px);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 9999;
		padding: 1rem;
	}

	.close {
		background: none;
		border: none;
		cursor: pointer;
		width: 2rem;
		height: 2rem;
		border-radius: 4px;
	}

	.actions {
		display: flex;
		gap: 0.5rem;
		justify-content: flex-end;
		padding-top: 1rem;
		border-top: 1px solid #e5e5e5;
	}

	.matches {
		list-style: none;
		margin: -0.5rem 0 0;
		padding: 0;
		font-size: 0.85rem;
	}

	.matches li {
		padding: 0.2rem 0;
		color: #555;
	}

	.matches li.exact {
		color: #c0392b;
		font-weight: 600;
	}
</style>
