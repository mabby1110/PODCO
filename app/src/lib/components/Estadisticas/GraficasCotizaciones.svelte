<script lang="ts">
	import Filtro from '$lib/components/App/Filtro.svelte';
	import { agrupacionesDocumentos, categoriasCliente } from '$lib';
	import Agrupaciones from '../App/Agrupaciones.svelte';
	import PanelFiltros from '../App/PanelFiltros.svelte';
	import Searchbar from '../App/Searchbar.svelte';
	import { page } from '$app/state';
	import { agruparDatosPorRuta, obtenerDatosFiltrados } from '$lib/utils/filtro';
	import FiltroAgente from '../FiltroAgente.svelte';
	import TotalXDocumento from './graficas/TotalXDocumento.svelte';

	let { cotizaciones } = $derived(page.data);

	let lista = $derived(cotizaciones);

	const ordenados = $derived(obtenerDatosFiltrados(lista, 'cotizaciones-bi'));
	const agrupados = $derived(agruparDatosPorRuta(lista, 'cotizaciones-bi'));

	let agrupaciones = $derived(
		agrupados.map((e) => {
			return { grupo: e.grupo, tamaño: e.elementos.length };
		})
	);

	let agrupacionesSeleccionadas: string[] = $state([]);
</script>

<div class="contenedor-graficas">
	<h1>Clientes</h1>
	<div class="contenedor-controles-graficas">
		<Searchbar data={cotizaciones} keyColumns={categoriasCliente.map((c) => c.key)} bind:lista />
		<PanelFiltros absolute>
			{#snippet header()}
				<FiltroAgente />
			{/snippet}
			{#snippet controles()}
				<Filtro categorias={categoriasCliente} cookies={'cotizaciones-bi'} />
				<Agrupaciones
					categorias={agrupacionesDocumentos}
					bind:agrupacionesSeleccionadas
					{agrupaciones}
					cookies={'cotizaciones-bi'}
				/>
			{/snippet}
		</PanelFiltros>
	</div>

	<div class="contenido-graficas">
		<TotalXDocumento data={agrupados} titulo={'Total Cotizado'}/>
	</div>
</div>
