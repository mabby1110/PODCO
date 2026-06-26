<script lang="ts">
	import ListaOportunidades from '$lib/components/Oportunidad/ListaOportunidades.svelte';
</script>

<div class="page-content">
	<ListaOportunidades />
</div>

<style>
	.page-content {
		display: flex;
		flex-direction: column;
		overflow: auto;
	}
</style>
