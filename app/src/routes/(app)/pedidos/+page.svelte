<script lang="ts">
	import ListaPedidos from '$lib/components/Pedidos/ListaPedidos.svelte';
</script>

<div class="page-content">
	<ListaPedidos />
</div>

<style>
	.page-content {
		display: flex;
		flex-direction: column;
		overflow: auto;
	}
</style>
