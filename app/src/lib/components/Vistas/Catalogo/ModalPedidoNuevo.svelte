<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto, invalidateAll } from '$app/navigation';
	import { page } from '$app/state';
	import { StorePedidoNuevo } from '$lib/stores/pedidos/StorePedidoNuevo.svelte';
	let canSubmit = $derived(StorePedidoNuevo.carrito.length > 0);

	let carrito = $derived(
		StorePedidoNuevo.carrito.map((item) => ({
			...item,
			producto: page.data.catalogo.find((p) => p.id === item.id)
		}))
	);
</script>

<form
	method="POST"
	action="/catalogo?/restock"
	use:enhance={() => {
		return async ({ result, update }) => {
			if (result.type === 'success') {
				await invalidateAll();
				await update({ reset: true });
				StorePedidoNuevo.reset();
				goto('/pedidos');
			}
		};
	}}
>
	<input type="hidden" name="carrito" value={JSON.stringify(StorePedidoNuevo.carrito)} />
	<div class="carrito">
		{#each carrito as elemento}
			<div class="item">
				<p>{elemento.producto.codigo}</p>
				<button
					type="button"
					class="butter"
					onclick={() => StorePedidoNuevo.pop(elemento.id)}
				>
					-
				</button>

				<span class="butter">{elemento.cantidad}</span>

				<button
					type="button"
					class="butter"
					onclick={() => StorePedidoNuevo.push(elemento.id)}
				>
					+
				</button>
			</div>
		{/each}
	</div>

	<button class="butter matcha submit" type="submit" disabled={!canSubmit}> Agregar </button>
</form>

<style>
	form {
		display: flex;
		flex-direction: column;
		flex-grow: 1;
	}
	form .submit {
		position: sticky;
		align-self: flex-end;
		bottom: var(--a);
		right: var(--a);
	}
	.carrito {
		display: flex;
		flex-direction: column;
		flex-grow: 1;
	}
	.item {
		display: flex;
	}
</style>
