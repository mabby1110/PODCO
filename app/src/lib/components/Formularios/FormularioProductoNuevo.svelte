<script lang="ts">
	import { page } from '$app/state';

	let {
		productoNuevo = $bindable<Record<string, any>>({}),
		canSubmit = $bindable(false),
		tipoId = $bindable<string>('')
	} = $props();

	let tipo_producto = $derived(page.data.tipo_producto);
	let tipoSeleccionado = $derived(tipo_producto?.find((t: any) => t.id == tipoId));
	let schema = $derived(tipoSeleccionado?.caracteristicas?.formulario_registro || []);

	$effect(() => {
		if (tipoId) {
			productoNuevo = {};
		}
	});

	$effect(() => console.log(productoNuevo.length));
</script>

<section>
	<div class="section-header">
		<h3>Categoria producto</h3>
	</div>
	<div class="section-content">
		<select bind:value={tipoId} name="id_tipo_producto" title="Selecciona un categoría" required>
		<option value="" disabled selected>Categoría</option>
			{#each tipo_producto || [] as t}
				<option value={t.id}>{t.nombre}</option>
			{/each}
		</select>
		<div class="especificos">
			{#each schema as campo}
				{#if campo.tipo === 'select'}
					<select
						id={campo.id_campo}
						required={campo.requerido}
						placeholder={campo.placeholder}
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
						placeholder={campo.placeholder}
						bind:value={productoNuevo[campo.id_campo]}
					/>
				{/if}
			{/each}
		</div>
	</div>
</section>
{#if tipoId && schema.length}
	<span>Resumen</span>
	<pre>{JSON.stringify(productoNuevo, null, 2)}</pre>
{/if}

<style>
	.section-content {
		flex-direction: column;
		align-items: flex-start;
	}
	.especificos {
		display: flex;
		flex-direction: column;
		gap: var(--a);
	}
</style>
