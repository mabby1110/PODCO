<script lang="ts">
	import { agrupacionesDocumentos, categoriasDocumentos } from '$lib';
	import Agrupaciones from '$lib/components/Acciones/Agrupaciones.svelte';
	import ExportarCSV from '$lib/components/Acciones/ExportarCSV.svelte';
	import Filtro from '$lib/components/Acciones/Filtro.svelte';
	import FiltroAgente from '$lib/components/Acciones/FiltroAgente.svelte';
	import PanelFiltros from '$lib/components/Acciones/PanelFiltros.svelte';
	import Searchbar from '$lib/components/Acciones/Searchbar.svelte';
	import Grupo from '$lib/components/Tarjetas/Grupo.svelte';
	import Lista from '$lib/components/Tarjetas/Lista.svelte';
	import Vista from '$lib/components/Tarjetas/Vista.svelte';
	import TarjetaListaDocumentos from '$lib/components/Vistas/Documentos/TarjetaListaDocumentos.svelte';
	import { StoreAgrupaciones } from '$lib/stores/StoreAgrupaciones.svelte';

	const carpetas = [{id: '1tX20yAyoU3EAOj0hMHgi3OnM3VQ1thzL', titulo: 'SIHI'}, {id: '1tX20yAyoU3EAOj0hMHgi3OnM3VQ1thzL', titulo: 'SIHI'}];
</script>

<Vista>
	{#snippet acciones()}
		<!-- <Searchbar data={documentos} keyColumns={categoriasDocumentos.map((a) => a.key)} bind:lista />
		<PanelFiltros>
			{#snippet header()}
				<ExportarCSV {lista_ordenada} />
			{/snippet}
			{#snippet controles()}
				<FiltroAgente />
				<Filtro categorias={categoriasDocumentos} />
				<Agrupaciones categorias={agrupacionesDocumentos} bind:agrupacionesSeleccionadas {grupos} />
			{/snippet}
		</PanelFiltros> -->
	{/snippet}
	{#snippet contenido()}
		<Lista items={carpetas}>
			{#snippet children(elemento)}
				<div class="librero">
					<h2>{elemento.titulo}</h2>
					<iframe
						title="Recursos en drive"
						src="https://drive.google.com/embeddedfolderview?id={elemento.id}#grid"
						style="width:100%;height:600px;border:0"
					></iframe>
				</div>
			{/snippet}
		</Lista>
	{/snippet}
</Vista>
