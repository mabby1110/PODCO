<script lang="ts">
	import ConstructorFormulario from '$lib/components/Formularios/ConstructorFormulario.svelte';

	let { canSubmit = $bindable(false) }: { canSubmit?: boolean } = $props();

	let nombre = $state('');
	let serializado = $state(false);
	let caracteristicas = $state('{"formulario_registro":[]}');
	let formularioValido = $state(true);

	$effect(() => {
		canSubmit = formularioValido && !!nombre.trim();
	});
</script>

<div class="form-group">
	<label>
		Nombre
		<input
			type="text"
			name="nombre"
			required
			bind:value={nombre}
			oninput={() => (nombre = nombre.toUpperCase())}
		/>
	</label>

	<label>
		Es serializado
		<input type="checkbox" name="serializado" bind:checked={serializado} />
	</label>
</div>

<ConstructorFormulario bind:value={caracteristicas} bind:valido={formularioValido} />
<input type="hidden" name="caracteristicas" value={caracteristicas} />
