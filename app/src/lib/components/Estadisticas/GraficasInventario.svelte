<script lang="ts">
	import { categoriasInventario } from '$lib';
	import Searchbar from '../App/Searchbar.svelte';
	import { page } from '$app/state';
	import { agruparDatosPorRuta, obtenerDatosFiltrados } from '$lib/utils/filtro';
	import InventarioCantidadXGrupo from './graficas/InventarioCantidadXGrupo.svelte';
	
	let { inventario } = $derived(page.data);
	let lista = $derived(inventario);

	const ordenados = $derived(obtenerDatosFiltrados(lista, 'inventario-bi'));
	const agrupados = $derived(agruparDatosPorRuta(lista, 'inventario-bi'));
	let agrupaciones = $derived(
		agrupados.map((e) => {
			return { grupo: e.grupo, tamaño: e.elementos.length };
		})
	);

	let agrupacionesSeleccionadas: string[] = $state([]);
</script>

<div class="contenedor-graficas">
	<h1>Inventario</h1>
	<div class="contenedor-controles-graficas">
		<Searchbar data={inventario} keyColumns={categoriasInventario.map(i=>i.key)} bind:lista />
		<!-- <PanelFiltros absolute>
			{#snippet header()}
				<FiltroAgente />
			{/snippet}
			{#snippet controles()}
				<Filtro categorias={categoriasInventario} cookies={'inventario-bi'} />
				<Agrupaciones
					categorias={agrupacionesInventario}
					bind:agrupacionesSeleccionadas
					{agrupaciones}
					cookies={'inventario-bi'}
				/>
			{/snippet}
		</PanelFiltros> -->
	</div>

	<div class="contenido-graficas">
		<InventarioCantidadXGrupo data={agrupados} titulo="categoria" categoria="cantidad"/>
	</div>
</div>
