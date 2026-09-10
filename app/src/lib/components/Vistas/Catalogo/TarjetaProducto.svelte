<script lang="ts">
	import { StorePedidoNuevo } from "$lib/stores/pedidos/StorePedidoNuevo.svelte";

	let { elemento } = $props();
</script>
<button onclick={() => StorePedidoNuevo.push(elemento.id)}>
	{elemento.codigo}
</button>
