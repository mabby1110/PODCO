<script lang="ts">
	import Filtro from '$lib/components/App/Filtro.svelte';
	import Agrupaciones from '../App/Agrupaciones.svelte';
	import PanelFiltros from '../App/PanelFiltros.svelte';
	import Searchbar from '../App/Searchbar.svelte';
	import { page } from '$app/state';
	import { agruparDatosPorRuta, obtenerDatosFiltrados } from '$lib/utils/filtro';
	import FiltroAgente from '../FiltroAgente.svelte';
	import OrdenadosTotalXDocumento from './graficas/OrdenadosTotalXDocumento.svelte';
	import AgrupadosTotalXDocumento from './graficas/AgrupadosTotalXDocumento.svelte';

	let { cotizaciones } = $derived(page.data);
	// guardamos lista para poder manipular data
	let lista = $derived(cotizaciones);

	// cadena de variables reactivas, data > lista > lista_odenada > lista_agrupada
	let lista_ordenada = $derived(obtenerDatosFiltrados(lista, 'cotizaciones-bi'));
	let lista_agrupada = $derived(agruparDatosPorRuta(lista_ordenada, 'cotizaciones-bi'));

	let grupos = $derived(
		lista_agrupada.map((e) => {
			return { grupo: e.grupo, tamaño: e.elementos.length };
		})
	);
	let agrupacionesSeleccionadas: string[] = $derived(grupos.map((a: any) => a.grupo));

	$effect(() => {
		lista_agrupada?.filter((a) => agrupacionesSeleccionadas.includes(a.grupo));
	});

	const filtrosCotizaciones = [{ key: 'total', label: 'total' }];
	const agrupacionesCotizaciones = [
		{ value: 'id_agente', label: 'id_agente' },
		{ value: 'id_oportunidad', label: 'id_oportunidad' },
		{ value: 'id_cliente', label: 'id_cliente' }
	];

	$effect(() => {
		console.log('lista_agrupada: ', lista_agrupada);
		console.log('agrupacionesSeleccionadas: ', agrupacionesSeleccionadas);
		console.log('lista: ', lista);
	});
</script>

<div class="contenedor-graficas">
	<h1>Ventas</h1>
	<div class="contenedor-controles-graficas">
		<Searchbar data={cotizaciones} keyColumns={filtrosCotizaciones.map((c) => c.key)} bind:lista />
		<PanelFiltros absolute>
			{#snippet header()}
				<FiltroAgente />
			{/snippet}
			{#snippet controles()}
				<Filtro categorias={filtrosCotizaciones} cookies={'cotizaciones-bi'} />
				<Agrupaciones
					categorias={agrupacionesCotizaciones}
					bind:agrupacionesSeleccionadas
					{grupos}
					cookies={'cotizaciones-bi'}
				/>
			{/snippet}
		</PanelFiltros>
	</div>

	<div class="contenido-graficas">
		<AgrupadosTotalXDocumento data={lista_agrupada} {grupos} titulo={'Top Cotizado por grupo'} />
		<OrdenadosTotalXDocumento data={lista_ordenada} titulo={'Total Cotizado Ordenado'} />
	</div>
</div>
