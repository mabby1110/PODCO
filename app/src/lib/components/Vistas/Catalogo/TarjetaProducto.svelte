<script lang="ts">
	import { StoreEntradaInventario } from "$lib/stores/StoreEntradaInventario.svelte";

	let { elemento } = $props();
</script>
<button onclick={() => StoreEntradaInventario.push(elemento.id)}>
	{elemento.codigo}
</button>
