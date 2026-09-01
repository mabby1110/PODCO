<script lang="ts">
	import { page } from '$app/state';

	let {
		productoNuevo = $bindable<Record<string, any>>({}),
		canSubmit = $bindable(false),
		tipoId = $bindable(0)
	} = $props();

	let tipos_producto = $derived(page.data.tipos_producto);
	let tipoSeleccionado = $derived(tipos_producto?.find((t: any) => t.id == tipoId));
	let schema = $derived(tipoSeleccionado?.caracteristicas?.formulario_registro || []);

	$effect(() => {
		if (schema.length === 0) {
			canSubmit = false;
			return;
		}

		const camposRequeridos = schema.filter((campo) => campo.requerido);

		canSubmit = camposRequeridos.every((campo) => {
			const valor = productoNuevo[campo.id_campo];

			return valor !== undefined && valor !== null && valor !== '';
		});
	});
    
	$effect(() => {
		if (tipoId) {
			productoNuevo = {};
		}
	});

	$effect(() => console.log(productoNuevo.length));
</script>

<select bind:value={tipoId}>
	<option value={0}>Selecciona un tipo...</option>
	{#each tipos_producto || [] as t}
		<option value={t.id}>{t.nombre}</option>
	{/each}
</select>

{#each schema as campo}
	<div style="margin-bottom: 1rem;">
		<label for={campo.id_campo}>
			{campo.etiqueta}
			{#if campo.unidad}
				({campo.unidad})
			{/if}
			{#if campo.requerido}
				*
			{/if}
		</label>
		<br />

		{#if campo.tipo === 'select'}
			<select
				id={campo.id_campo}
				required={campo.requerido}
				bind:value={productoNuevo[campo.id_campo]}
			>
				<option value="">Seleccione...</option>
				{#each campo.opciones || [] as opcion}
					<option value={opcion}>{opcion}</option>
				{/each}
			</select>
		{:else}
			<input
				type={campo.tipo}
				id={campo.id_campo}
				required={campo.requerido}
				bind:value={productoNuevo[campo.id_campo]}
			/>
		{/if}
	</div>
{/each}

{#if tipoId}
	<pre>{JSON.stringify(productoNuevo, null, 2)}</pre>
{/if}
