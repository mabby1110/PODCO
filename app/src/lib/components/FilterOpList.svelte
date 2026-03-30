<script lang="ts">
	import { page } from '$app/state';
	import { filterStore } from '$lib/stores/filterStore.svelte';

	const agentes = $derived(page.data.agentes ?? []);
	let profile = $state(page.data.profile);
	let selected = $state(profile.isAdmin ? filterStore.atributo : profile.id);
	$effect(() => {
		console.log(selected);
		filterStore.atributo = selected != '' ? selected : '';
	});

</script>

{#if profile.isAdmin}
	<div class="filter-container">
		<select bind:value={selected} class="butter">
			<option value="">Todos los agentes</option>
			{#each agentes as agente}
				<option value={String(agente.id)}>{agente.nombre}</option>
			{/each}
		</select>
	</div>
{/if}

<!-- <input
		type="text"
		bind:value={keyword}
		placeholder="Buscar oportunidades..."
	/> -->

<style>
	.filter-container {
		display: flex;
		flex-wrap: wrap;
		gap: var(--a);
		justify-content: end;
	}
</style>
