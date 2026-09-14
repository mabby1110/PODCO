<script lang="ts">
	import { StorePedidoOportunidad } from '$lib/stores/pedidos/StorePedidoOportunidad.svelte';
	import { onMount } from 'svelte';
	import SubirCotizacion from '../Documentos/SubirCotizacion.svelte';

	onMount(StorePedidoOportunidad.limpiar);
	let { oportunidad } = $props();
	let potencial_venta = $derived(oportunidad.pedidos.filter((p) => p.id_cotizacion == null));
	let pedidoACotizarInvalido = $derived(
		oportunidad.pedidos.some((p) =>
			StorePedidoOportunidad.carrito.some((item) => item.id === p.id && p.precio_unitario === null)
		)
	);
	$effect(()=>console.log(pedidoACotizarInvalido));
	function seleccionarPedido(id: string) {
		if (StorePedidoOportunidad.carrito.some((item) => item.id === id)) {
			StorePedidoOportunidad.pop(id);
		} else {
			StorePedidoOportunidad.push(id);
		}
	}

	function seleccionarPedidoCompleto() {
		StorePedidoOportunidad.pushLista(potencial_venta);
	}
</script>

<div>
	{#each potencial_venta as pedido}
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->

		<!-- Aplicamos un estilo en línea dinámico o una clase si el ID está en el store -->
		<div
			onclick={() => seleccionarPedido(pedido.id)}
			style:border={StorePedidoOportunidad.carrito.some((item) => item.id === pedido.id)
				? '2px solid var(--color-highlight)'
				: '2px solid transparent'}
			style:padding="1rem"
			style:margin-bottom="1rem"
		>
			{#each Object.entries(pedido) as [clave, valor]}
				{#if clave === 'catalogo' && valor !== null}
					<div>
						<strong>catalogo:</strong>
						<div style="margin-left: 1rem;">
							{#each Object.entries(valor) as [catClave, catValor]}
								<div><strong>{catClave}:</strong> {catValor}</div>
							{/each}
						</div>
					</div>
				{:else if clave === 'oportunidades' && valor !== null}
					<div>
						<strong>Oportunidad:</strong>
						<div style="margin-left: 1rem;">
							{#each Object.entries(valor) as [catClave, catValor]}
								<div><strong>{catClave}:</strong> {catValor}</div>
							{/each}
						</div>
					</div>
				{:else if typeof valor !== 'object'}
					<div><strong>{clave}:</strong> {valor}</div>
				{/if}
			{/each}
			<hr />
		</div>
	{/each}

	{#if StorePedidoOportunidad.carrito.length > 0 && !pedidoACotizarInvalido}
		<SubirCotizacion
			tipo="docs_cotizaciones"
			action="/documentos?/subirCotizacion"
			oportunidad={{
				id: oportunidad?.id,
				cliente: oportunidad?.clientes.nombre_comercial || oportunidad?.clientes.razon_social
			}}
			required
		/>
	{:else}
		<div class="acciones">
			<!-- Corregido: editarPedidoCompleto -> seleccionarPedidoCompleto -->
			<button class="butter" onclick={seleccionarPedidoCompleto}>Cotizar todo</button>
		</div>
	{/if}
</div>
