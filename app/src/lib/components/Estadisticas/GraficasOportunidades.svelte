<script lang="ts">
	import { agrupacionesOportunidades, categoriasOportunidad} from '$lib';
	import Agrupaciones from '../App/Agrupaciones.svelte';
	import PanelFiltros from '../App/PanelFiltros.svelte';
	import Searchbar from '../App/Searchbar.svelte';
	import { page } from '$app/state';
	import { procesarDatosReactivos } from '$lib/utils/filtro';
	import FasesXOportunidad from './graficas/FasesXOportunidad.svelte';
	import Filtro from '../App/Filtro.svelte';
	import FiltroAgente from '../FiltroAgente.svelte';

	let { oportunidades } = $derived(page.data);

	let lista = $derived(oportunidades);

	const listaAgrupada = $derived.by(() => procesarDatosReactivos(lista, 'oportunidades-bi'));
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
	<h1>Oportunidades</h1>
	<div class="contenedor-controles-graficas">
		<FiltroAgente />
		<Searchbar data={oportunidades} keyColumns={['serie', 'codigo', 'descripcion']} bind:lista />
		<PanelFiltros absolute>
			{#snippet controles()}
				<Filtro categorias={categoriasOportunidad} cookies={'oportunidades-bi'} />
				<Agrupaciones
					categorias={agrupacionesOportunidades}
					bind:agrupacionesSeleccionadas
					{agrupaciones}
					cookies={'oportunidades-bi'}
				/>
			{/snippet}
		</PanelFiltros>
	</div>

	<div class="contenido-graficas">
		<FasesXOportunidad data={listaFiltrada} />
	</div>
</div>
