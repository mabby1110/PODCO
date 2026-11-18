<!-- SelecciónCotizacion.svelte -->
<script lang="ts">
	import { untrack } from 'svelte';
	import { StoreCotizado } from '$lib/stores/pedidos/StorePedidoOportunidad.svelte';
	import SubirCotizacion from '../Documentos/SubirCotizacion.svelte';
	import { fasesPedido } from '$lib';
	import { StorePedidoEditar } from '$lib/stores/pedidos/StorePedidoEditar.svelte';
	import { StorePedidoNuevo } from '$lib/stores/pedidos/StorePedidoNuevo.svelte';
	import { StoreContextoRelacion } from '$lib/stores/pedidos/StoreContextoRelacion.svelte';
	import { goto } from '$app/navigation';
	import { StoreAplicacion } from '$lib/stores/app/StoreAplicacion.svelte';
	import ItemLista from '$lib/components/Tarjetas/ItemLista.svelte';

	interface Pedido {
		id: string;
		id_agrupacion: string | null;
		id_cotizacion: string | null;
		precio_unitario: number | null;
		cantidad: number;
		moneda: string | null;
		ref?: string | null;
		catalogo?: { codigo?: string | null } | null;
	}

	interface Grupo {
		nombre_grupo: string;
		grupo: Pedido[];
	}

	interface Oportunidad {
		id: string;
		pedidos: Pedido[];
		clientes?: {
			nombre_comercial?: string | null;
			razon_social?: string | null;
		} | null;
	}

	let { oportunidad }: { oportunidad: Oportunidad } = $props();

	const potencialVenta = $derived(oportunidad.pedidos.filter((p) => p.id_cotizacion == null));

	const grupos = $derived.by<Grupo[]>(() => {
		const mapa = new Map<string, Grupo>();
		for (const pedido of potencialVenta) {
			const nombre_grupo = pedido.id_agrupacion || 'Sin grupo';
			const existente = mapa.get(nombre_grupo);
			if (existente) existente.grupo.push(pedido);
			else mapa.set(nombre_grupo, { nombre_grupo, grupo: [pedido] });
		}
		return [...mapa.values()];
	});

	const idsSeleccionados = $derived(new Set(StoreCotizado.carrito.map((item) => item.id)));

	const gruposConSeleccion = $derived(
		grupos.filter((g) => g.grupo.some((p) => idsSeleccionados.has(p.id))).length
	);

	$effect(() => {
		oportunidad.id;
		untrack(() => StoreCotizado.limpiar());
	});

	$effect(() => {
		const vigentes = new Set(potencialVenta.map((p) => p.id));
		untrack(() => {
			StoreCotizado.carrito
				.filter((item) => !vigentes.has(item.id))
				.forEach((item) => StoreCotizado.pop(item.id));
		});
	});

	function seleccionarPedido(id: string) {
		if (idsSeleccionados.has(id)) StoreCotizado.pop(id);
		else StoreCotizado.push(id);
	}

	function seleccionarGrupo(grupo: Pedido[]) {
		const pendientes = grupo.filter((p) => !idsSeleccionados.has(p.id));
		if (pendientes.length === 0) grupo.forEach((p) => StoreCotizado.pop(p.id));
		else StoreCotizado.pushLista(pendientes);
	}

	function normalizarMoneda(moneda: string | null | undefined): string {
		if (!moneda) return 'USD';
		const m = moneda.toUpperCase();
		return m === 'MX' ? 'MXN' : m;
	}

	function subtotal(pedido: Pedido): number | null {
		if (pedido.precio_unitario == null) return null;
		return pedido.precio_unitario * pedido.cantidad;
	}

	function formatMoneda(val: number | null | undefined, moneda: string | null = 'USD') {
		if (val == null) return 'Sin precio';
		return new Intl.NumberFormat('es-MX', {
			style: 'currency',
			currency: normalizarMoneda(moneda),
			currencyDisplay: 'narrowSymbol'
		}).format(val);
	}

	async function editarPedido(grupo: Pedido[]) {
		StorePedidoEditar.limpiar();
		StorePedidoNuevo.limpiar();
		StorePedidoEditar.pushLista(grupo);
		StoreContextoRelacion.setOportunidad(oportunidad.id);
		await goto('/pedidos');
		StoreAplicacion.set('modal_editar_pedido', true);
	}
</script>

{#each grupos as agrupacion (agrupacion.nombre_grupo)}
	{@const seleccionadosGrupo = agrupacion.grupo.filter((p) => idsSeleccionados.has(p.id))}
	{@const algunSeleccionado = seleccionadosGrupo.length > 0}
	{@const monedas = new Set(agrupacion.grupo.map((p) => normalizarMoneda(p.moneda)))}
	{@const monedaMixta = monedas.size > 1}
	{@const monedaGrupo = [...monedas][0] ?? 'USD'}
	{@const sinPrecio = seleccionadosGrupo.some((p) => !p.precio_unitario)}
	{@const totalGrupo = agrupacion.grupo.reduce((acc, p) => acc + (subtotal(p) ?? 0), 0)}
	{@const otroGrupoSeleccionado = algunSeleccionado ? gruposConSeleccion > 1 : gruposConSeleccion > 0}

	<div class="pan honey pedido">
		<button
			class="badge"
			type="button"
			style={fasesPedido[2]?.estilo}
			onclick={() => editarPedido(agrupacion.grupo)}
		>
			<span>Potencial de Venta</span>
		</button>

		{#each agrupacion.grupo as pedido (pedido.id)}
			{@const seleccionado = idsSeleccionados.has(pedido.id)}

			<ItemLista onclick={() => seleccionarPedido(pedido.id)}>
				{#snippet acciones()}
					<input
						class="milk"
						type="checkbox"
						checked={seleccionado}
						aria-label="Seleccionar {pedido.catalogo?.codigo || 'pedido'}"
						onclick={(e) => e.stopPropagation()}
						onchange={() => seleccionarPedido(pedido.id)}
					/>
				{/snippet}

				{#snippet titulo()}
					<strong class="codigo">{pedido.catalogo?.codigo || 'Sin código'}</strong>
				{/snippet}

				{#snippet contenido()}
					<span class="ref" class:text-danger={pedido.ref == null}>
						{pedido.ref}
					</span>
					<span class="precio" class:text-danger={pedido.precio_unitario == null}>
						{pedido.cantidad} x {formatMoneda(pedido.precio_unitario, pedido.moneda)}
					</span>
					<b class="subtotal">
						{formatMoneda(subtotal(pedido), pedido.moneda)}
					</b>
				{/snippet}
			</ItemLista>
		{/each}

		{#if monedaMixta}
			<p class="text-danger">No se pueden mezclar monedas en un mismo grupo.</p>
		{:else}
			<h1 class="total">
				<button class="link" type="button" onclick={() => seleccionarGrupo(agrupacion.grupo)}>
					{formatMoneda(totalGrupo, monedaGrupo)} {monedaGrupo}
				</button>
			</h1>
		{/if}

		<div class="acciones-panel">
			{#if algunSeleccionado && !monedaMixta}
				{#if gruposConSeleccion > 1}
					<p class="text-danger">Solo se puede cotizar un grupo a la vez.</p>
				{:else if sinPrecio}
					<button class="alerta-error" type="button" onclick={() => editarPedido(agrupacion.grupo)}>
						<strong>Atención:</strong>
						<u>Uno o más pedidos seleccionados no tienen precio unitario. Presiona para editar.</u>
					</button>
				{:else}
					<SubirCotizacion
						tipo="docs_cotizaciones"
						action="/documentos?/subirCotizacion"
						oportunidad={{
							id: oportunidad.id,
							cliente: oportunidad.clientes?.nombre_comercial || oportunidad.clientes?.razon_social
						}}
						required
					/>
				{/if}
			{/if}
		</div>
	</div>
{:else}
	<p class="estado-vacio">No hay pedidos pendientes por cotizar en esta oportunidad.</p>
{/each}

<style>
	.total {
		text-align: end;
	}
</style>