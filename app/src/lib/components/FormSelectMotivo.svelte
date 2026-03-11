<script lang="ts">
	// Motivos base
	let {
		title = 'Motivo',
		disableCustom = true,
		list = [
			'Prospección en frío',
			'Prospección inbound',
			'Seguimiento de cliente',
			'Cotización solicitada',
			'Renovación de contrato',
			'Proyecto nuevo',
			'Ampliación de proyecto',
			'Licitación pública',
			'Licitación privada',
			'Refacciones / repuestos (bomba Durco)',
			'Mantenimiento correctivo',
			'Mantenimiento preventivo',
			'Servicio en sitio',
			'Visita técnica',
			'Viaje comercial',
			'Postventa',
			'Reclamación / garantía',
			'Recompra',
			'Urgencia operativa'
		]
	} = $props();

	let selected = $state('');
	let custom = $state('');
	let motivo = $state('');

	// Valor final que se envía
	$effect(() => {
		motivo = selected === '__otro__' ? custom : selected;
	});
</script>

<label>
	<span>{title}</span>

	<select class="butter" bind:value={selected} required>
		<option value="" disabled selected>Selecciona un motivo</option>
		{#if !disableCustom}
			<option value="__otro__">Otro…</option>
		{/if}

		{#each list as item}
			<option value={item}>{item}</option>
		{/each}
	</select>
</label>

{#if selected === '__otro__'}
	<label>
		<span>Especificar motivo</span>
		<input
			class="butter"
			type="text"
			bind:value={custom}
			placeholder="Describe el motivo"
			required
		/>
	</label>
{/if}

<!-- Valor final para el formulario -->
<input type="hidden" name="motivo" value={motivo} />
