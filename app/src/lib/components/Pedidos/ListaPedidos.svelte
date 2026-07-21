<script lang="ts">
	import { page } from '$app/state';
	import { agruparDatos, agruparDatosPorRuta, obtenerDatosFiltrados } from '$lib/utils/filtro';
	import { formatCurrency } from '$lib/utils/util';
	import ContadorProducto from './ContadorProducto.svelte';
	let { pedidos } = $derived(page.data);

	let lista = $derived(pedidos);
	let agrupacion = $state('id_agrupacion');
	let lista_agrupada = $derived(agruparDatos(lista, agrupacion));
	console.log(lista);
</script>

<div class="pedidos">
	{#each lista_agrupada as grupo}
		<div class="pedido panel">
			<div class="producto" style="font-weight: bold;">
				<span class="descripcion">Descripción</span>
				<span class="codigo">Código</span>
				<span>Moneda</span>
				<span class="cantidad">P/U</span>
				<span class="cantidad">Cantidad</span>
				<span class="total">total</span>
			</div>
			{#each grupo.elementos as item}
				<div class="producto">
					<span class="descripcion">{item.inventario.descripcion || '-'}</span>
					<span class="codigo"
						>{item.inventario.serie || item.inventario.codigo || 'sin código'}</span
					>
					<span>USD</span>
					<span class="cantidad">
						<input type="number" name="total" bind:value={item.inventario.precio} />
					</span>
					<span class="cantidad">
						<ContadorProducto producto={item.inventario} />
					</span>
					<span class="total"
						>{formatCurrency(String(item.inventario.precio * item.piezas), 'USD')}</span
					>
				</div>
			{/each}
		</div>
	{/each}
</div>

<style>
	.pedidos {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(70px, 1fr));
		gap: var(--a);
	}
	.pedido {
        grid-column: span 3;
		background-color: var(--color-secondary);
	}
</style>
