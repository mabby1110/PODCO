<!-- +page.svelte -->
<script lang="ts">
	import { page } from '$app/state';
	import ExportarCSV from '$lib/components/Acciones/ExportarCSV.svelte';
	import Grupo from '$lib/components/Tarjetas/Grupo.svelte';
	import Vista from '$lib/components/Tarjetas/Vista.svelte';
	import TarjetaListaOportunidades from '$lib/components/Vistas/Oportunidad/PrevistaOportunidad.svelte';
	import { appState } from '$lib/stores/appState.svelte';
	import { categoriasOportunidad, fasesOportunidad } from '$lib';
	import { sortData, filterData, groupData, extraerColumnas } from '$lib/utils/ModList';
	import { StoreModList } from '$lib/stores/StoreModList.svelte';
	import Searchbar from '$lib/components/Acciones/Searchbar.svelte';
	import ModList from '$lib/components/Acciones/ModList.svelte';
	import Controles from '$lib/components/Acciones/Controles.svelte';
	import Leyenda from '$lib/components/Tarjetas/Leyenda.svelte';
	import { StoreAplicacion } from '$lib/stores/app/StoreAplicacion.svelte';
	import RecuentoOportunidades from '$lib/components/Vistas/Estadisticas/oportunidades/RecuentoOportunidades.svelte';

	let { oportunidades } = $derived(page.data);
	let currentRoute = $derived(page.url.pathname);

	// Convertido a $state para soportar bind:lista
	let lista = $state(oportunidades);
	let columnasDinamicas = $derived(extraerColumnas(oportunidades));
	let isGrouped = $derived(StoreModList.get(currentRoute).groupBy !== null);

	console.log('Oportunidades', lista.length);
	let lista_ordenada = $derived.by(() => {
		console.time('1. Ordenamiento');

		const result = sortData(lista, currentRoute);

		console.timeEnd('1. Ordenamiento');
		return result;
	});

	let lista_filtrada = $derived.by(() => {
		console.time('2. Filtrado');

		const result = filterData(lista_ordenada, currentRoute);

		console.timeEnd('2. Filtrado');
		return result;
	});

	let lista_agrupada = $derived.by(() => {
		if (!isGrouped) return [];

		console.time('3. Agrupación');

		const result = groupData(lista_filtrada, currentRoute);

		console.timeEnd('3. Agrupación');
		return result;
	});

	$effect(() => {
		lista = oportunidades;
	});
</script>

<Vista>
	{#snippet portada()}
		<RecuentoOportunidades {oportunidades} />
	{/snippet}
	{#snippet acciones()}
		<Controles>
			{#snippet header()}
				<ExportarCSV lista_ordenada={lista_filtrada} />
				<button class="link" onclick={() => appState.toggleModalOp()}>+Oportunidad</button>
				<button class="link" onclick={() => StoreAplicacion.toggle('retraer')}
					>{StoreAplicacion.value.retraer ? 'retraer' : 'expandir'}</button
				>
				<button class="link" onclick={() => StoreAplicacion.toggle('leyenda')}>leyenda</button>
			{/snippet}
			{#snippet acciones()}
				<Leyenda steps={fasesOportunidad} />
				<Searchbar
					data={oportunidades}
					keyColumns={categoriasOportunidad.map((c) => c.key).concat(['clientes'])}
					bind:lista
				/>
				<ModList {columnasDinamicas} route={currentRoute} ordenar agrupar />
			{/snippet}
		</Controles>
	{/snippet}

	{#snippet contenido()}
		{#if isGrouped}
			{#each lista_agrupada as agrupacion (agrupacion.columna)}
				<Grupo {agrupacion}>
					{#snippet children(elemento: any)}
						<TarjetaListaOportunidades oportunidad={elemento} />
					{/snippet}
				</Grupo>
			{:else}
				<div class="no-results">
					<p>No se encontraron datos.</p>
				</div>
			{/each}
		{:else}
			{#each lista_filtrada as oportunidad (oportunidad.id)}
				<TarjetaListaOportunidades {oportunidad} />
			{:else}
				<div class="no-results">
					<p>No se encontraron datos.</p>
				</div>
			{/each}
		{/if}
	{/snippet}
</Vista>
