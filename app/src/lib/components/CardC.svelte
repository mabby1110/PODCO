<script lang="ts">
	import { selectedClient } from "$lib/stores/selectedClient";

	let { client } = $props();
	function select() {
		selectedClient.set({ ...client });
	}
</script>

<button class="butter card-container" onclick={select}>
	<b>{client.razon_social}</b>
	<p>oportunidades abiertas: 3</p>
</button>

<style>
	.card-container {
		text-align: start;
		min-height: var(--e);
	}
</style>
