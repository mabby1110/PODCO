<script lang="ts">
	import { enhance } from '$app/forms';
	import { appState } from '$lib/stores/appState.svelte';
	import FormNewClient from './FormNewClient.svelte';
	import { page } from '$app/state';
	import { invalidateAll } from '$app/navigation';
	import FormSelectAgente from '$lib/components/Formularios/FormSelectAgente.svelte';
	import { onMount } from 'svelte';
	import { StoreHotkeys } from '$lib/stores/StoreHotkeys.svelte';

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
	onMount(() => {
		return StoreHotkeys.registerEscape('mi-panel', () => {
			$appState.ModalClient ? appState.toggleModalClient() : 0;
		});
	});
</script>

{#if $appState.ModalClient}
	<div
		class="overlay honey"
		role="button"
		tabindex="0"
		onkeydown={(e) => e.key === 'Escape' && appState.toggleModalClient()}
	>
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<div class="modal" onclick={(e) => e.stopPropagation()} role="dialog" tabindex="-1">
			<div class="modal-header">
				<h2>Nuevo Cliente</h2>
				<button class="jelly rojo" onclick={() => appState.toggleModalClient()}>✕</button>
			</div>
			<form
				method="POST"
				action="?/add"
				use:enhance={() => {
					appState.toggleModalClient();
					invalidateAll();
					selectedDataItem = null;
					alert('creado con exito!');
				}}
			>
				<div class="form-content">
					<FormSelectAgente />
					<FormNewClient bind:isDuplicate />
				</div>

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
