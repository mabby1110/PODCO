<script lang="ts">
	import { enhance } from '$app/forms';
	import Pedido from '$lib/components/Tarjetas/Pedido.svelte';
	import SubirCotizacion from '../Documentos/SubirCotizacion.svelte';

	let {
		pedidos,
		oportunidad,
		editando = false,
		currentFase = 0
	}: { pedidos: any[]; oportunidad?: any; editando?: boolean; currentFase?: number } = $props();
	let edit = $derived(editando);
	$effect(() => console.log(editando, edit));
</script>

<div class="pedido">
	<div class="panel grupo">
		{#each pedidos as item}
			<Pedido {item} {editando} hot />
		{/each}
		{currentFase}
		{#if currentFase <= 4}
			<SubirCotizacion
				name={'docs_cotizaciones'}
				amountLabel="Total cotizado"
				amountName="totales"
				id_nodo_p={oportunidad?.id}
				cliente={oportunidad?.cliente}
				agente={oportunidad?.agente}
				pedidos={pedidos}
				required
			/>
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
