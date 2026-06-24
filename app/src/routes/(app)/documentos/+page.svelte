<script lang="ts">
	import ListaDocumentos from '$lib/components/Documentos/ListaDocumentos.svelte';
</script>

<div class="page-content">
    <ListaDocumentos />
</div>

<style>
    .page-content {
        display: flex;
        flex-direction: column;
        overflow: auto;
    }
</style>