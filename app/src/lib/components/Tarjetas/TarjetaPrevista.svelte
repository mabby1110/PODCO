<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		titulo,
		contenido,
		meta,
		acciones,
		metaAcciones,
		mas,
		style = ''
	}: {
		titulo: Snippet;
		contenido: Snippet;
		meta?: Snippet;
		acciones?: Snippet;
		metaAcciones?: Snippet;
		mas?: Snippet;
		style?: string;
	} = $props();

	let show = $state(false);
	function handleClick() {
		show = !show;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			handleClick();
		}
	}
</script>

<div class="contenedor">
	{#if metaAcciones}
		<div class="meta-acciones">
			{@render metaAcciones()}
		</div>
	{/if}
	<div
		role="button"
		tabindex="0"
		onclick={handleClick}
		onkeydown={handleKeydown}
		{style}
		class="butter tarjeta-prevista"
	>
		<div class="meta">
			{#if meta}
				{@render meta()}
			{/if}
		</div>
		<div class="titulo" class:show>
			{#if titulo}
				{@render titulo()}
			{/if}
		</div>
		<div class="contenido" class:show>
			{#if contenido}
				{@render contenido()}
			{/if}
			{#if mas && show}
				{@render mas()}
			{/if}
		</div>
		{#if acciones && show}
			<div class="acciones">
				{@render acciones()}
			</div>
		{/if}
	</div>
</div>

<style>
	.contenedor {
		display: flex;
		gap: var(--a);
	}
	.tarjeta-prevista {
		position: relative;
		width: 100%;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(var(--h), 1fr));
		padding: var(--a);
		gap: 0 var(--a);
	}
	.contenido {
		grid-column: span 2;
		display: grid;
		gap: 0 var(--a);
		grid-template-columns: repeat(auto-fit, minmax(var(--g), 1fr));
		grid-column: span 2;
		max-height: var(--f);
		overflow: hidden;
	}
	.acciones {
		grid-column: -1 / -2;
		display: flex;
		justify-content: flex-end;
	}
	.show {
		padding: var(--a);
		grid-column: 1 / -1;
		max-height: 70vh;
	}
	.meta {
		grid-column: 1 / -1;
		font-size: var(--b);
		display: flex;
		gap: var(--a);
		align-items: center;
	}
</style>
