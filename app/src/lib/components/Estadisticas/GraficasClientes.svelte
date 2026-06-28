<script lang="ts">
	import Filtro from '$lib/components/App/Filtro.svelte';
	import CantidadXLista from './graficas/CantidadXLista.svelte';
	import { agrupacionesCliente, categoriasCliente } from '$lib';
	import Agrupaciones from '../App/Agrupaciones.svelte';
	import PanelFiltros from '../App/PanelFiltros.svelte';
	import Searchbar from '../App/Searchbar.svelte';
	import { page } from '$app/state';
	import { agruparDatosPorRuta, obtenerDatosFiltrados } from '$lib/utils/filtro';
	import FiltroAgente from '../FiltroAgente.svelte';
	import CantidadXGrupo from './graficas/CantidadXGrupo.svelte';

	let { clientes } = $derived(page.data);

	let lista = $derived(clientes);

	const clientes_ordenados = $derived(obtenerDatosFiltrados(lista, 'clientes-bi'));
	const agrupados = $derived(agruparDatosPorRuta(lista, 'clientes-bi'));

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
		<Searchbar data={clientes} keyColumns={categoriasCliente.map((c) => c.key)} bind:lista />
		<PanelFiltros absolute>
			{#snippet header()}
				<FiltroAgente />
			{/snippet}
			{#snippet controles()}
				<Filtro categorias={categoriasCliente} cookies={'clientes-bi'} />
				<Agrupaciones
					categorias={agrupacionesCliente}
					bind:agrupacionesSeleccionadas
					{agrupaciones}
					cookies={'clientes-bi'}
				/>
			{/snippet}
		</PanelFiltros>
	</div>

	<div class="contenido-graficas">
		<CantidadXLista data={clientes_ordenados} titulo={'cliente'} categoria={'oportunidades'} />
		<CantidadXLista data={clientes_ordenados} titulo={'cliente'} categoria={'contactos'} />
		<CantidadXGrupo data={agrupados} titulo={'grupo'} categoria={'oportunidades'} />
	</div>
</div>
