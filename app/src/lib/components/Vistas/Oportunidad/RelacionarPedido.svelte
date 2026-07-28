<script lang="ts">
	import { page } from '$app/state';
	import { enhance } from '$app/forms';
	import { StoreEditarPedido } from '$lib/stores/StoreEditarPedido.svelte';
	import { agruparDatos } from '$lib/utils/filtro';
	import { formatCurrency } from '$lib/utils/util';
	import { goto } from '$app/navigation';

	// Recibe el parámetro de la página actual
	let { id_oportunidad }: { id_oportunidad: string } = $props();

	let { pedidos } = $derived(page.data);
	let agrupacion = $state('id_agrupacion');
	let lista_agrupada = $derived(agruparDatos(pedidos, agrupacion));

	function seleccionarAgrupacion(elementos: any[]) {
		StoreEditarPedido.limpiar();
		elementos.forEach((item) => {
			StoreEditarPedido.agregar(item);
		});
	}

	function removerItem(item: any) {
		// Ajustar la propiedad identificadora según la implementación del Store
		StoreEditarPedido.remover(item);
	}
	$effect(() => console.log(StoreEditarPedido.items));
</script>

<button class="butter" onclick={()=>goto('/inventario')}>+Pedido nuevo</button>
<div class="pedidos">
	{#if StoreEditarPedido.items.length === 0}
		{#each lista_agrupada as grupo}
			<button class="panel grupo" onclick={() => seleccionarAgrupacion(grupo.elementos)}>
				{#each grupo.elementos as item}
					<div class="pedido">
						<div class="descripcion">
							<b>{item.inventario.descripcion || '-'}</b>
							<a href="/oportunidades/{item.id_oportunidad}">{item.id_oportunidad}</a>
						</div>
						<span class="codigo"
							>{item.inventario.serie || item.inventario.codigo || 'sin código'}</span
						>
						<span>{item.cantidad}</span>
						<span><p>${item.precio_unitario || 0}</p></span>
						<span>USD</span>
						<span class="total"
							>{formatCurrency(String(item.precio_unitario * item.cantidad), 'USD')}</span
						>
					</div>
				{/each}
			</button>
		{/each}
	{:else}
		<div class="panel grupo">
			{#each StoreEditarPedido.items as item}
				<div class="pedido">
					<div class="descripcion">
						<b>{item.inventario.descripcion || '-'}</b>
						<a href="/oportunidades/{item.id_oportunidad}">{item.id_oportunidad}</a>
					</div>
					<span class="codigo"
						>{item.inventario.serie || item.inventario.codigo || 'sin código'}</span
					>
					<span>{item.cantidad}</span>
					<span><p>${item.precio_unitario || 0}</p></span>
					<span>USD</span>
					<span class="total"
						>{formatCurrency(String(item.precio_unitario * item.cantidad), 'USD')}</span
					>
					<button type="button" class="btn-remover" onclick={() => removerItem(item)}>X</button>
				</div>
			{/each}
		</div>
		<form
			method="POST"
			action="/inventario?/updatePedido"
			class="form-acciones"
			use:enhance={({ formData }) => {
				if (StoreEditarPedido.items.length > 0) {
					const pedidosAActualizar = StoreEditarPedido.items.map((item) => ({
						id: item.id,
						id_oportunidad: id_oportunidad
					}));

					formData.append('pedidosAActualizar', JSON.stringify(pedidosAActualizar));
				}
			}}
		>
			<button class="butter" type="submit">Relacionar Pedido</button>
			<button class="butter" type="button" onclick={() => StoreEditarPedido.limpiar()}
				>Cancelar</button
			>
		</form>
	{/if}
</div>

<style>
	.pedidos {
		flex-grow: 1;
		display: flex;
		flex-direction: column;
		gap: var(--a);
		padding: var(--a);
		max-height: 60vh;
		height: fit-content;
		overflow: auto;
	}
	.grupo {
		grid-column: span 6;
		background-color: var(--color-foreground);
		display: flex;
		flex-direction: column;
		cursor: pointer;
	}
	.pedido {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(var(--d), 1fr));
		gap: var(--a);
		align-items: baseline;
		padding: 4px;
		justify-items: center;
	}
	.pedido .descripcion {
		grid-column: span 5;
		word-break: break-all;
		justify-self: flex-start;
		display: flex;
		flex-direction: column;
	}
	.pedido .codigo {
		grid-column: span 2;
		word-break: break-all;
		justify-self: flex-start;
	}
	.pedido .total {
		grid-column: span 2;
		word-break: break-all;
	}
	.headers {
		display: flex;
		flex-wrap: wrap;
		gap: var(--a);
		position: sticky;
		top: 0;
		z-index: 1;
	}
	.btn-remover {
		color: #ff4d4f;
		background: none;
		border: none;
		font-weight: bold;
		cursor: pointer;
		padding: 4px 8px;
	}
	.btn-remover:hover {
		background-color: #ff4d4f20;
		border-radius: 4px;
	}
	.form-acciones {
		display: flex;
		gap: var(--a);
		padding: var(--a);
		justify-content: flex-end;
	}
</style>
