<script lang="ts">
	import Pedido from '$lib/components/Vistas/Pedidos/Pedido.svelte';
	import { StorePedido } from '$lib/stores/StorePedido.svelte';
	import { appState } from '$lib/stores/appState.svelte';
	import { goto } from '$app/navigation';
	import SubirCotizacion from '../Documentos/SubirCotizacion.svelte';

	let {
		pedidos,
		oportunidad,
		editando = false
	}: { pedidos: any[]; oportunidad?: any; editando?: boolean; currentFase?: number } = $props();
	$effect(() => console.log(pedidos));
	function editarPedidoSeleccionado() {
		StorePedido.limpiar();
		pedidos.forEach((item) => {
			StorePedido.agregar(item);
		});
		appState.setEditarPedido(true);
		goto('/inventario');
	}
</script>

<div class="pedido">
	<div class="panel grupo">
		{#each pedidos as item}
			{#if item.estatus === 'aprobado'}
				<Pedido {item} cold={editando} />
			{/if}
		{/each}
		{#if editando && pedidos.some(p=>p.estatus=='aprobado')}
			<div class="acciones">
				<SubirCotizacion
					name={'docs_cotizaciones'}
					amountLabel="Total cotizado"
					amountName="totales"
					id_nodo={oportunidad?.id}
					id_cliente={oportunidad?.cliente.id}
					agente={oportunidad?.agente}
					{pedidos}
					required
				/>
				<button class="butter editar" onclick={editarPedidoSeleccionado}>Editar</button>
			</div>
		{/if}
	</div>
</div>

<style>
	.pedido {
		display: flex;
		flex-direction: column;
		width: 100%;
	}
	.acciones {
		width: 100%;
		display: flex;
		flex-wrap: wrap;
		padding: var(--a);
		gap: var(--a);
		justify-content: flex-end;
		align-items: flex-end;
	}
</style>
