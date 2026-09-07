<script lang="ts">
	import { goto } from '$app/navigation';
	import { StorePedidoEditar } from '$lib/stores/pedidos/StorePedidoEditar.svelte';

	let { pedidos } = $props();
	
	function navegar(id_agrupacion: string) {
		goto(`/pedidos/${id_agrupacion}`);
	}
	function editarPedido(id: string) {
		StorePedidoEditar.push(id);
		StorePedidoEditar.toggleModal(true);
	}
	function editarPedidoCompleto() {
		StorePedidoEditar.pushLista(pedidos);
		StorePedidoEditar.toggleModal(true);
	}
</script>

<div>
	{#each pedidos as pedido}
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div onclick={()=>editarPedido(pedido.id)}>
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
	<div class="acciones">
		<button class="butter" onclick={editarPedidoCompleto}>seleccionar</button>
	</div>
</div>