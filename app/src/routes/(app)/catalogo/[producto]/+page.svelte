<script lang="ts">
	import { page } from '$app/state';
	import EditableInput from '$lib/components/Formularios/EditableInput.svelte';
	import Card from '$lib/components/Tarjetas/Card.svelte';

	const producto = $derived(page.data.item);
	console.log('vista producto: ', producto);
	// ESTADO
	let editando = $state(false);
</script>

{#if producto}
	<Card>
		{#snippet header()}
			<div class="card-title">
				<div class="card-content">
					<h1>{producto.codigo}</h1>
				</div>
				<div class="card-meta"></div>
			</div>
		{/snippet}

		{#snippet contenido()}
			<EditableInput
				{editando}
				id={producto.id}
				label="Descripcion"
				name="descripcion"
				type="textarea"
				value={producto.descripcion}
				action="/catalogo?/actualizarProducto"
				placeholder="Descripcion del producto"
			>
				{#snippet header()}
					<input type="hidden" name="id" value={producto.id} />
				{/snippet}
			</EditableInput>
		{/snippet}
	</Card>
{/if}
