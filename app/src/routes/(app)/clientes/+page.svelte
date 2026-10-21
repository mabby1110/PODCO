<script lang="ts">
	import { page } from '$app/state';
	import Controles from '$lib/components/Acciones/Controles.svelte';
	import ExportarCSV from '$lib/components/Acciones/ExportarCSV.svelte';
	import ModList from '$lib/components/Acciones/ModList.svelte';
	import Searchbar from '$lib/components/Acciones/Searchbar.svelte';
	import Grupo from '$lib/components/Tarjetas/Grupo.svelte';
	import Vista from '$lib/components/Tarjetas/Vista.svelte';
	import CardClienteListPreview from '$lib/components/Vistas/Cliente/CardClienteListPreview.svelte';
	import { appState } from '$lib/stores/appState.svelte';
	import { StoreModList } from '$lib/stores/StoreModList.svelte';
	import { extraerColumnas, filterData, groupData, sortData } from '$lib/utils/ModList';

	let { cartera } = $derived(page.data);
	let show = $derived($appState.min);
	let currentRoute = $derived(page.url.pathname);
	let lista = $state(cartera);
	let columnasDinamicas = $derived(extraerColumnas(cartera));
	let lista_ordenada = $derived(sortData(lista, currentRoute));
	let lista_filtrada = $derived(filterData(lista_ordenada, currentRoute));
	let lista_agrupada = $derived(groupData(lista_filtrada, currentRoute));
	let isGrouped = $derived(StoreModList.get(currentRoute).groupBy !== null);

	$effect(() => {
		lista = cartera;
	});
</script>

<Vista>
	{#snippet acciones()}
		<Controles>
			{#snippet header()}
				<!-- <ExportarCSV {lista_ordenada} /> -->
				<button onclick={() => appState.toggleModalClient()} class="butter">+Cliente</button>
			{/snippet}
			{#snippet acciones()}
				<ModList {columnasDinamicas} route={currentRoute} ordenar agrupar />
				<Searchbar data={cartera} keyColumns={columnasDinamicas.map((a) => a.key)} bind:lista />
			{/snippet}
		</Controles>
	{/snippet}

	{#snippet contenido()}
		{#if !isGrouped}
			{#each lista_ordenada as elemento}
				<CardClienteListPreview client={elemento} />
			{/each}
		{:else}
			{#each lista_agrupada as agrupacion (agrupacion.columna)}
				<Grupo {agrupacion} showByDefault={show}>
					{#each agrupacion.items as elemento (elemento.id)}
						<CardClienteListPreview client={elemento} />
					{/each}
				</Grupo>
			{:else}
				<div class="no-results">
					<p>No se encontraron datos.</p>
				</div>
			{/each}
		{/if}
	{/snippet}
</Vista>
