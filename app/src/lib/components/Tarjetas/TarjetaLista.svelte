<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		metaAcciones,
		titulo,
		input,
		resumen
	}: {
		metaAcciones?: Snippet;
		titulo: Snippet;
		input?: Snippet;
		resumen?: Snippet;
	} = $props();
</script>

<div class="tarjeta-lista">
	<div class="meta-acciones">
		{#if metaAcciones}
			{@render metaAcciones()}
		{/if}
	</div>

	<div class="contenido">
		<div class="titulo">
			{#if titulo}
				{@render titulo()}
			{/if}
		</div>
		<div class="input">
			{#if input}
				{@render input()}
			{/if}
		</div>
	</div>
	<div class="resumen">
		{#if resumen}
			{@render resumen()}
		{/if}
	</div>
</div>

<style>
	.tarjeta-lista {
		width: 100%;
		display: flex;
		align-items: baseline;
	}
	.contenido {
		flex-grow: 1;
		display: grid;
        grid-template-columns: repeat(auto-fit, minmax(var(--f), 1fr));
		align-items: baseline;
	}
	.input {
        grid-column: span 2;
		display: flex;
		flex-wrap: wrap;
		gap: var(--y);
	}
	.resumen {
		display: flex;
        justify-content: flex-end;
        min-width: var(--f);
	}
</style>
