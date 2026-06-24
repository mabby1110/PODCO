<script lang="ts">
	import ListaInventario from '$lib/components/Inventario/ListaInventario.svelte';
</script>

<div class="page-content">
	<ListaInventario />
</div>

<style>
	.page-content {
		display: flex;
		flex-direction: column;
		overflow: auto;
	}
</style>
