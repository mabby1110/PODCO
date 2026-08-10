<script lang="ts">
	import { enhance } from '$app/forms';
	import Pedido from '$lib/components/Tarjetas/Pedido.svelte';

	let { pedidos, editando = false }: { pedidos: any[]; editando?: boolean } = $props();
	let edit = $derived(editando);
	$effect(() => console.log(editando, edit));
</script>

<div class="pedido">
	<div class="panel grupo">
		{#each pedidos as item}
			<Pedido {item} {editando} hot/>
		{/each}
		<!-- total -->
	</div>
</div>

<style>
	.pedido {
		display: flex;
		flex-direction: column;
		width: 90%;
	}
</style>
