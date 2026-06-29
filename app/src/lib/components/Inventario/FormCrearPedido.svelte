<script>
	import { productosSeleccionadosStore } from "$lib/stores/productosSeleccionadosStore.svelte";
	import FormInput from "../FormInput.svelte";

</script>
<FormInput
	label="Número de Orden BMS"
	name="no_orden"
	placeholder="Serial BMS"
	type="text"
	bind:value={no_orden}
/>
<button
	class="butter submit"
	type="submit"
	disabled={productosSeleccionadosStore.items.length === 0}
>
	Crear Pedido
</button>
