<script lang="ts">
	import Filtro from '$lib/components/App/Filtro.svelte';
	import { agrupacionesCliente, categoriasCliente } from '$lib';
	import Agrupaciones from '../App/Agrupaciones.svelte';
	import PanelFiltros from '../App/PanelFiltros.svelte';
	import Searchbar from '../App/Searchbar.svelte';
	import { page } from '$app/state';
	import { procesarDatosReactivos } from '$lib/utils/filtro';
	import CantidadXGrupo from './graficas/CantidadXGrupo.svelte';

	let { clientes } = $derived(page.data);

	let lista = $derived(clientes);

	const listaAgrupada = $derived.by(() => procesarDatosReactivos(lista, 'clientes-bi'));
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
		<Searchbar data={clientes} keyColumns={categoriasCliente.map((c) => c.key)} bind:lista />
		<PanelFiltros>
			{#snippet controles()}
				<Filtro categorias={categoriasCliente} customRoute={'clientes-bi'} />
				<Agrupaciones
					categorias={agrupacionesCliente}
					bind:agrupacionesSeleccionadas
					{agrupaciones}
				/>
			{/snippet}
		</PanelFiltros>
	</div>

	<h1>Clientes</h1>
	<div class="contenido-graficas">
		<CantidadXGrupo data={listaFiltrada} />
	</div>
</div>
