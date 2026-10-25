<script lang="ts">
	// Motivos base
	let {
		title = 'Motivo',
		disableCustom,
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
		],
		name = 'motivo',
		placeholder="Describe el motivo",
		defaultOption="Selecciona una opción"
	}:
	{
		title?: string;
		disableCustom?: boolean;
		list?: string[];
		name?: string;
		placeholder?: string;
		defaultOption?: string;
	} = $props();

	let selected = $state('');
	let custom = $state('');
	let motivo = $state('');

	// Valor final que se envía
	$effect(() => {
		motivo = selected === '__otro__' ? custom : selected;
	});
</script>

<section>
	<div class="section-header">
		<h3>{title}</h3>
	</div>
	<div class="section-content">
		<select class="milk" bind:value={selected} required>
			<option value="" disabled selected>{defaultOption}</option>
			{#if !disableCustom}
				<option value="__otro__">Otro…</option>
			{/if}

			{#each list as item}
				<option value={item}>{item}</option>
			{/each}
		</select>
	</div>
</section>

{#if selected === '__otro__'}
	<section>
		<div class="section-header">
			<h3>Especificar</h3>
		</div>
		<div class="section-content">
			<input
				class="milk"
				type="text"
				bind:value={custom}
				{placeholder}
				required
			/>
		</div>
	</section>
{/if}

<!-- Valor final para el formulario -->
<input type="hidden" {name} value={motivo} />
