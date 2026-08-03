<!-- +page.svelte -->
<script lang="ts">
	import { page } from '$app/state';
	import ExportarCSV from '$lib/components/Acciones/ExportarCSV.svelte';
	import Grupo from '$lib/components/Tarjetas/Grupo.svelte';
	import Vista from '$lib/components/Tarjetas/Vista.svelte';
	import TarjetaListaOportunidades from '$lib/components/Vistas/Oportunidad/TarjetaListaOportunidades.svelte';
	import { appState } from '$lib/stores/appState.svelte';
	import { categoriasOportunidad } from '$lib';
	import { sortData, filterData, groupData, extraerColumnas } from '$lib/utils/ModList';
	import { StoreModList } from '$lib/stores/StoreModList.svelte';
	import Searchbar from '$lib/components/Acciones/Searchbar.svelte';
	import PanelFiltros from '$lib/components/Acciones/PanelFiltros.svelte';
	import ModList from '$lib/components/Acciones/ModList.svelte';

	let { oportunidades } = $derived(page.data);
	let show = $derived($appState.min);
	let currentRoute = $derived(page.url.pathname);

	// Convertido a $state para soportar bind:lista
	let lista = $state(oportunidades);
	let columnasDinamicas = $derived(extraerColumnas(oportunidades));

	$effect(() => {
		lista = oportunidades;
	});

	let lista_ordenada = $derived(sortData(lista, currentRoute));
	let lista_filtrada = $derived(filterData(lista_ordenada, currentRoute));
	let lista_agrupada = $derived(groupData(lista_filtrada, currentRoute));

	let isGrouped = $derived(StoreModList.get(currentRoute).groupBy !== null);
</script>

<Vista>
	{#snippet acciones()}
		<Searchbar
			data={oportunidades}
			keyColumns={categoriasOportunidad.map((c) => c.key).concat(['clientes'])}
			bind:lista
		/>
		<PanelFiltros>
			{#snippet header()}
				<button onclick={() => appState.toggleModalOp()} class="butter">+Oportunidad</button>
				<ExportarCSV lista_ordenada={lista_filtrada} />
			{/snippet}
			{#snippet controles()}
                <ModList {columnasDinamicas} route={currentRoute} ordenar agrupar/>
			{/snippet}
		</PanelFiltros>
	{/snippet}

	{#snippet contenido()}
		{#if !isGrouped}
			{#each lista_filtrada as event (event.id)}
				<TarjetaListaOportunidades {event} />
			{:else}
				<div class="no-results">
					<p>No se encontraron datos.</p>
				</div>
			{/each}
		{:else}
			{#each lista_agrupada as agrupacion (agrupacion.columna)}
				<Grupo {agrupacion} showByDefault={show}>
					{#each agrupacion.items as event (event.id)}
						<TarjetaListaOportunidades {event} />
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
