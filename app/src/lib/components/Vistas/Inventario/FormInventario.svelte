<script lang="ts">
	import FormInput from '$lib/components/Formularios/FormInput.svelte';
	import FormOptionalInput from '$lib/components/Formularios/FormOptionalInput.svelte';
	import { slide } from 'svelte/transition';

	let { isValid = $bindable() } = $props();
	let ubicacion_fisica = $state('');
	let categorias = $state('');
	let cantidad = $state(1);
	let descripcion = $state('');
	let codigo = $state('');
	let observaciones = $state('');
	let serie = $state('');

</script>

<div class="form-content" out:slide>
	<FormInput
		label="Código"
		name="codigo"
		bind:value={codigo}
		placeholder="Codigo que identifica al producto"
		type="text"
	/>
	<FormOptionalInput title="+Serie">
		<FormInput
			label="Serie"
			name="serie"
			value={serie}
			type="textarea"
			required
		/>
	</FormOptionalInput>
	<FormInput
		label="Descripción"
		name="descripcion"
		bind:value={descripcion}
		placeholder="descripcion del producto"
		type="textarea"
	/>
	<FormInput
		label="Ubicacion física"
		name="ubicacion_fisica"
		bind:value={ubicacion_fisica}
		placeholder="ubicacion fisica del producto ej. A304"
		type="text"
	/>
	<FormInput
		label="Cantidad"
		name="cantidad"
		bind:value={cantidad}
		placeholder="cantidad de piezas"
		type="number"
	/>
	<FormInput
		label="Categorias"
		name="categorias"
		bind:value={categorias}
		placeholder="categoria del producto"
		type="text"
	/>
	<FormOptionalInput title="+Observaciones">
		<FormInput
			label="Observaciones"
			name="observaciones"
			value={observaciones}
			type="textarea"
			required
		/>
	</FormOptionalInput>
</div>

<style>
	.form-content {
		width: 100%;
		display: flex;
		flex-wrap: wrap;
		gap: var(--b);
	}
</style>
