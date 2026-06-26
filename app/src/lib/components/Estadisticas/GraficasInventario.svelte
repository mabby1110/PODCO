<script lang="ts">
	import { agrupacionesInventario, categoriasInventario } from '$lib';
	import Agrupaciones from '../App/Agrupaciones.svelte';
	import PanelFiltros from '../App/PanelFiltros.svelte';
	import Searchbar from '../App/Searchbar.svelte';
	import { page } from '$app/state';
	import { agruparDatosPorRuta, obtenerDatosFiltrados } from '$lib/utils/filtro';
	import CantidadXLista from './graficas/CantidadXLista.svelte';
	import Filtro from '../App/Filtro.svelte';
	import CantidadXGrupo from './graficas/CantidadXGrupo.svelte';
	import InventarioCantidadXLista from './graficas/InventarioCantidadXLista.svelte';
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
		<Searchbar data={inventario} keyColumns={['serie', 'codigo', 'descripcion']} bind:lista />
		<PanelFiltros absolute>
			{#snippet controles()}
				<Filtro categorias={categoriasInventario} cookies={'inventario-bi'} />
				<Agrupaciones
					categorias={agrupacionesInventario}
					bind:agrupacionesSeleccionadas
					{agrupaciones}
					cookies={'inventario-bi'}
				/>
			{/snippet}
		</PanelFiltros>
	</div>

	<div class="contenido-graficas">
		<InventarioCantidadXGrupo data={agrupados} titulo="categoria" categoria="cantidad"/>
	</div>
</div>
