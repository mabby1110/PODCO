<script lang="ts">
	let {
		value = $bindable(''),
		title = 'Motivo',
		disableCustom = false,
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
		placeholder = 'Describe el motivo',
		defaultOption = 'Selecciona una opción',
		required = true
	}: {
		value?: string;
		title?: string;
		disableCustom?: boolean;
		list?: string[];
		name?: string;
		placeholder?: string;
		defaultOption?: string;
		required?: boolean;
	} = $props();

	const OTHER = '__otro__';

	// Estado interno inicializado a partir del value que venga del padre
	let selected = $state(
		value === '' ? '' : list.includes(value) ? value : disableCustom ? '' : OTHER
	);
	let custom = $state(value !== '' && !list.includes(value) && !disableCustom ? value : '');

	// select/input -> value (hacia el padre)
	$effect(() => {
		value = selected === OTHER ? custom : selected;
	});

	// value -> select/input (cuando el padre lo cambia desde afuera)
	$effect(() => {
		const v = value;
		const current = selected === OTHER ? custom : selected;
		if (v === current) return;

		if (v === '') {
			selected = '';
			custom = '';
		} else if (list.includes(v)) {
			selected = v;
		} else if (!disableCustom) {
			selected = OTHER;
			custom = v;
		}
	});
</script>

<!-- Sin name: el valor real viaja en el input hidden -->
<select class="milk" bind:value={selected} {required} aria-label={title}>
	<option value="" disabled>{defaultOption}</option>
	{#if !disableCustom}
		<option value={OTHER}>Otro…</option>
	{/if}

	{#each list as item (item)}
		<option value={item}>{item}</option>
	{/each}
</select>

{#if selected === OTHER}
	<input class="milk" type="text" bind:value={custom} {placeholder} {required} />
{/if}

<!-- Valor final para el formulario tradicional (FormData / submit nativo) -->
<input type="hidden" {name} {value} />
