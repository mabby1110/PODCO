<script lang="ts">
	import TarjetaPedido from '$lib/components/Vistas/Pedidos/TarjetaPedido.svelte';
	import { StorePedido } from '$lib/stores/StorePedido.svelte';
	import { appState } from '$lib/stores/appState.svelte';
	import { goto } from '$app/navigation';
	import SubirCotizacion from '../Documentos/SubirCotizacion.svelte';

	let {
		pedidos,
		oportunidad,
		editando = false
	}: { pedidos: any[]; oportunidad?: any; editando?: boolean; currentFase?: number } = $props();

	function editarPedidoSeleccionado() {
		StorePedido.limpiar();
		pedidos.forEach((item) => {
			StorePedido.agregar(item);
		});
		appState.setEditarPedido(true);
		goto('/inventario');
	}
</script>

<div class="pedidos-relacionados">
	{#if pedidos.some((p) => p.estatus === 2)}
		<div class="panel grupo">
			{#each pedidos.filter((i) => i.estatus === 2) as item}
				<TarjetaPedido {item} cold={editando} />
			{/each}

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
				<button class="butter editar" onclick={editarPedidoSeleccionado}> Editar </button>
			</div>
		</div>
	{:else}
		<p class="mensaje-vacio">No hay pedidos seleccionados en este momento.</p>
	{/if}
</div>

<style>
	.pedidos-relacionados {
		width: 100%;
		display: flex;
		flex-direction: column;
	}
	.grupo {
		display: flex;
		flex-direction: column;
		gap: var(--a);
		padding: var(--a);
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
