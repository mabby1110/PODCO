<script lang="ts">
	// Motivos base
	let {
		motivos = [
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
	<span>Motivo</span>

	<select class="butter" bind:value={selected} required>
		<option value="" disabled selected>Selecciona un motivo</option>

		{#each motivos as m}
			<option value={m}>{m}</option>
		{/each}

		<option value="__otro__">Otro…</option>
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

<style>
	label {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}
</style>
