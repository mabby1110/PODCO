<script lang="ts">
	import { agrupacionesInventario, categoriasInventario } from '$lib';
	import Agrupaciones from '../App/Agrupaciones.svelte';
	import PanelFiltros from '../App/PanelFiltros.svelte';
	import Searchbar from '../App/Searchbar.svelte';
	import { page } from '$app/state';
	import { procesarDatosReactivos } from '$lib/utils/filtro';
	import CantidadXCategoria from './graficas/CantidadXCategoria.svelte';
	import PiezasXCategoria from './graficas/PiezasXCategoria.svelte';

	let { inventario } = $derived(page.data);

	let lista = $derived(inventario);

	const listaAgrupada = $derived.by(() => procesarDatosReactivos(lista, 'inventario-bi'));
	let agrupaciones = $derived(
		listaAgrupada.map((e) => {
			return { grupo: e.grupo, tamaño: e.elementos.length };
		})
	);

	let agrupacionesSeleccionadas: string[] = $state([]);

	let listaFiltrada = $derived(
		agrupacionesSeleccionadas.length === 0
			? listaAgrupada
			: listaAgrupada.filter((a) => agrupacionesSeleccionadas.includes(a.grupo))
	);
</script>

<div class="contenedor-graficas">
	<div class="controls">
		<Searchbar data={inventario} keyColumns={['serie', 'codigo', 'descripcion']} bind:lista />
		<PanelFiltros>
			{#snippet controles()}
				<Agrupaciones
					categorias={agrupacionesInventario}
					bind:agrupacionesSeleccionadas
					{agrupaciones}
				/>
			{/snippet}
		</PanelFiltros>
	</div>

	<h1>Inventario</h1>
	<div class="contenido-graficas">
		<CantidadXCategoria data={listaFiltrada} />
		<PiezasXCategoria data={listaFiltrada} />
	</div>
</div>
