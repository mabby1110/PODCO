<script lang="ts">
	import { goto } from '$app/navigation';
	import Contador from '$lib/components/Acciones/Contador.svelte';
	import TarjetaPrevista from '$lib/components/Tarjetas/TarjetaPrevista.svelte';
	let { elemento } = $props();

	// Unidades con número de serie
	let serializados = $derived(elemento?.serializados ?? []);
</script>

<TarjetaPrevista>
	{#snippet meta()}
		<p>{elemento.tipo_producto.nombre}</p>
	{/snippet}
	{#snippet titulo()}
		<h3>
			{elemento.codigo}
		</h3>
		<p>{elemento.descripcion}</p>
	{/snippet}
	{#snippet mas()}
		<div class="producto-meta">
			{#each serializados as unico}
				<p>{unico.serie}-{unico.estado}</p>
			{/each}
		</div>
	{/snippet}
	{#snippet acciones()}
		<button
			class="butter accion"
			onclick={(e) => {
				e.stopPropagation();
				goto(`/catalogo/${elemento.id}`);
			}}>ver</button
		>
	{/snippet}
	{#snippet metaAcciones()}
		<Contador id={elemento.id} />
	{/snippet}
</TarjetaPrevista>

<style>
	.producto-meta {
		display: flex;
		flex-direction: column;
		gap: var(--a);
	}
</style>
