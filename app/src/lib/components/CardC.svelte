<script lang="ts">
	let { client } = $props();
</script>

<button class="butter card-container">
	<b>{client.razon_social}</b>
	<p>oportunidades abiertas: 3</p>
</button>

<style>
	.card-container {
		text-align: start;
		min-height: var(--e);
	}
</style>
