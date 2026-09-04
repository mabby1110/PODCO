<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { StoreEntradaInventario } from '$lib/stores/StoreEntradaInventario.svelte';

	let canSubmit = $derived(StoreEntradaInventario.carrito.length > 0);
</script>

<form
	method="POST"
	action="/catalogo?/restock"
	use:enhance={() => {
		return async ({ result, update }) => {
			if (result.type === 'success') {
				await invalidateAll();
				await update({ reset: true });

				StoreEntradaInventario.toggleModal();
			}
		};
	}}
>
	<input type="hidden" name="carrito" value={JSON.stringify(StoreEntradaInventario.carrito)} />
	<div class="carrito">
		{#each StoreEntradaInventario.carrito as elemento}
			<div class="item">
				<p>{elemento.id}</p>
				<button
					type="button"
					class="butter"
					onclick={() => StoreEntradaInventario.pop(elemento.id)}
				>
					-
				</button>

				<span class="butter">{elemento.cantidad}</span>

				<button
					type="button"
					class="butter"
					onclick={() => StoreEntradaInventario.push(elemento.id)}
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
