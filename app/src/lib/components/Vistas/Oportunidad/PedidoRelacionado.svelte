<script lang="ts">
	import FormOptionalInput from '$lib/components/Formularios/FormOptionalInput.svelte';
	import Pedido from '$lib/components/Tarjetas/Pedido.svelte';
	import SubirCotizacion from '../Documentos/SubirCotizacion.svelte';

	let {
		pedidos,
		oportunidad,
		editando = false,
		currentFase = 0
	}: { pedidos: any[]; oportunidad?: any; editando?: boolean; currentFase?: number } = $props();
	let edit = $derived(editando);
	$effect(() => console.log(pedidos));
</script>

<div class="pedido">
	<div class="panel grupo">
		{#each pedidos as item}
			<Pedido {item} {editando} hot />
		{/each}
		{#if currentFase <= 4}
			{#if pedidos[0].docs_cotizaciones}
				<p>{pedidos[0].docs_cotizaciones.titulo}</p>
				{#if editando}
					<SubirCotizacion
						name={'docs_cotizaciones'}
						amountLabel="Total cotizado"
						amountName="totales"
						id_nodo_p={oportunidad?.id}
						cliente={oportunidad?.cliente}
						agente={oportunidad?.agente}
						{pedidos}
						required
					/>
				{/if}
			{:else}
				<SubirCotizacion
					name={'docs_cotizaciones'}
					amountLabel="Total cotizado"
					amountName="totales"
					id_nodo_p={oportunidad?.id}
					cliente={oportunidad?.cliente}
					agente={oportunidad?.agente}
					{pedidos}
					required
				/>
			{/if}
		{/if}
	</div>
</div>

<style>
	.pedido {
		display: flex;
		flex-direction: column;
		width: 90%;
	}
</style>
