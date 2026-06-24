<script lang="ts">
    import ListaActividades from '$lib/components/Actividad/ListaActividades.svelte';
</script>

<div class="page-content">
    <ListaActividades />
</div>

<style>
    .page-content {
        display: flex;
        flex-direction: column;
        overflow: auto;
    }
</style>