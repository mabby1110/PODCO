<script lang="ts">
	import type { Snippet } from 'svelte';
	import { slide } from 'svelte/transition';
	import ContadorProducto from '../Pedidos/ContadorProducto.svelte';

	let { event } = $props();

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
	function handleNavigationClick(e: MouseEvent) {
		e.stopPropagation();
		window.location.href = '/';
	}
</script>

<div
	role="button"
	tabindex="0"
	onclick={handleClick}
	onkeydown={handleKeydown}
	style={event?.style}
	class="product"
>
	<div class="product-header">
		<b class="tiny">{event?.serie || event?.codigo}</b>
		<p>{event?.descripcion}</p>
	</div>
	
	<div class="product-actions">
		<ContadorProducto producto={event} />
	</div>
	<div class="product-meta">
		<p>{event?.categorias}</p>
		<p>{event?.ubicacion_fisica}</p>
	</div>
</div>

<style>
	.product {
		position: relative;
		padding: 4px var(--a);

		background-color: var(--color-secondary);
		border-radius: var(--a);
		cursor: pointer;
		white-space: pre-wrap;

		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
	}

	.product-header {
		width: 100%;

		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 0 var(--a);
	}
	.product-meta {
		display: flex;
		flex-wrap: wrap;
		gap: var(--a);
		font-size: smaller;
		align-items: end;
	}
	.product-actions {
		right: var(--a);
	}
</style>
