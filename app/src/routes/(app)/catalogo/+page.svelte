<script lang="ts">
	import { page } from '$app/state';
	import ExportarCSV from '$lib/components/Acciones/ExportarCSV.svelte';
	import Searchbar from '$lib/components/Acciones/Searchbar.svelte';
	import Grupo from '$lib/components/Tarjetas/Grupo.svelte';
	import Vista from '$lib/components/Tarjetas/Vista.svelte';
	import { appState } from '$lib/stores/appState.svelte';
	import { extraerColumnas, filterData, groupData, sortData } from '$lib/utils/ModList';
	import { StoreModList } from '$lib/stores/StoreModList.svelte';
	import ModList from '$lib/components/Acciones/ModList.svelte';
	import PrevistaProducto from '$lib/components/Vistas/Catalogo/PrevistaProducto.svelte';
	import Controles from '$lib/components/Acciones/Controles.svelte';
	import HotButton from '$lib/components/Acciones/HotButton.svelte';
	import { StoreAplicacion } from '$lib/stores/app/StoreAplicacion.svelte';
	import Lista from '$lib/components/Tarjetas/Lista.svelte';
	import { onDestroy } from 'svelte';

	let { catalogo } = $derived(page.data);
	let currentRoute = $derived(page.url.pathname);
	let lista = $state(catalogo);

	let isGrouped = $derived(StoreModList.get(currentRoute).groupBy !== null);
	let columnasDinamicas = $derived(extraerColumnas(catalogo));

	console.log('Catalogo', lista.length);

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
		lista = catalogo;
	});
	onDestroy(() => {
		StoreAplicacion.set('modal_editar_pedido', false);
	});
</script>

<Vista>
	{#snippet acciones()}
		<Controles>
			{#snippet header()}
				<ExportarCSV lista_ordenada={lista_filtrada} />
				<button onclick={() => appState.toggleModalProducto()} class="link">+Producto Nuevo</button>
				<button class="link" onclick={() => StoreAplicacion.toggle('retraer')}
					>{StoreAplicacion.value.retraer ? 'retraer' : 'expandir'}</button
				>
			{/snippet}
			{#snippet acciones()}
				<ModList {columnasDinamicas} route={currentRoute} agrupar ordenar />
				<Searchbar data={catalogo} keyColumns={['codigo', 'descripcion']} bind:lista />
			{/snippet}
		</Controles>
		<HotButton
			id_store="modal_editar_pedido"
			key="w"
			onclick={() => StoreAplicacion.toggle('modal_editar_pedido')}
		>
			Pedido
		</HotButton>
	{/snippet}
	{#snippet contenido()}
		{#if isGrouped}
			{#each lista_agrupada as agrupacion (agrupacion.columna)}
				<Grupo {agrupacion}>
					{#snippet children(elemento: any)}
						<PrevistaProducto {elemento} />
					{/snippet}
				</Grupo>
			{:else}
				<div class="no-results">
					<p>No se encontraron datos.</p>
				</div>
			{/each}
		{:else}
			<Lista items={lista_ordenada}>
				{#snippet children(elemento)}
					<PrevistaProducto {elemento} />
				{/snippet}
			</Lista>
		{/if}
	{/snippet}
</Vista>
