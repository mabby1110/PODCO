<script lang="ts">
	import ClientList from '$lib/components/Cliente/ListaClientes.svelte';
</script>

<div class="page-content">
	<ClientList />
</div>

<style>
	.page-content {
		display: flex;
		flex-direction: column;
		overflow: auto;
	}
</style>
