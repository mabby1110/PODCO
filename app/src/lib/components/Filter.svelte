<script lang="ts">
	import { page } from '$app/state';
	import { filterStore } from '$lib/stores/filterStore.svelte';

	const agentes = $derived(page.data.agentes ?? []);
	// Variable local para el bind - debe ser string para el select
	let keyword = $state(filterStore.keyword ?? '');
	let profile = $state(page.data.profile);
	let selected = $state(profile.isAdmin ? '' : profile.id);
	// Sincronizar cambios de la variable local al store
	$effect(() => {
		// Convierte a número si no está vacío, sino ''
		filterStore.atributo = selected !== '' ? selected : '';
	});

	$effect(() => {
		filterStore.keyword = keyword;
	});
</script>

{#if profile.isAdmin}
	<select bind:value={selected} class="butter">
		<option value="">Todos</option>
		{#each agentes as agente}
			<option value={String(agente.id)}>{agente.nombre}</option>
		{/each}
	</select>
{/if}

<!-- <input
		type="text"
		bind:value={keyword}
		placeholder="Buscar oportunidades..."
	/> -->
