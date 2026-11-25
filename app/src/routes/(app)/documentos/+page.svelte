<script lang="ts">
	import Lista from '$lib/components/Tarjetas/Lista.svelte';
	import Vista from '$lib/components/Tarjetas/Vista.svelte';
	const carpetas = [{id: '1g2Lldnkrd_QnK3_Bq9eeXHNCoIopKz-3', titulo: 'INNOMAG'}];
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
