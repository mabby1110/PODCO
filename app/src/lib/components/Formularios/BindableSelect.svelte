<script lang="ts">
	let {
		value = $bindable(''),
		title = 'Motivo',
		disableCustom = false,
		list = [],
		name = 'motivo',
		placeholder = 'Describe el motivo',
		defaultValue = 'Selecciona una opción',
		required = true
	}: {
		value?: string | null;
		title?: string;
		disableCustom?: boolean;
		list?: string[];
		name?: string;
		placeholder?: string;
		defaultValue?: string | null;
		required?: boolean;
	} = $props();

	const OTHER = '__otro__';

	// Función auxiliar para detectar null, undefined, '' o ' ' (puros espacios)
	const isNullOrEmpty = (val: string | null | undefined) => !val || val.trim() === '';

	// Estado interno inicializado a partir del value que venga del padre
	let selected = $state(
		isNullOrEmpty(value)
			? ''
			: list.includes(value as string)
				? (value as string)
				: disableCustom
					? ''
					: OTHER
	);
	let custom = $state(
		!isNullOrEmpty(value) && !list.includes(value as string) && !disableCustom
			? (value as string)
			: ''
	);

	// select/input -> value (hacia el padre)
	$effect(() => {
		value = selected === OTHER ? custom : selected;
	});

	// value -> select/input (cuando el padre lo cambia desde afuera)
	$effect(() => {
		const v = value;
		const current = selected === OTHER ? custom : selected;

		if (v === current) return;

		if (isNullOrEmpty(v)) {
			selected = '';
			custom = '';
		} else if (list.includes(v as string)) {
			selected = v as string;
		} else if (!disableCustom) {
			selected = OTHER;
			custom = v as string;
		}
	});
</script>

<div class="contenedor">
	<select class="milk" bind:value={selected} {required} aria-label={title}>
		<option value="" disabled>{defaultValue ?? 'Selecciona una opción'}</option>
		{#each list as item (item)}
			<option value={item}>{item}</option>
		{/each}

		{#if !disableCustom}
			<option value={OTHER}>Otro…</option>
		{/if}
	</select>

	{#if selected === OTHER}
		<input class="milk" type="text" bind:value={custom} {placeholder} {required} />
	{/if}

	<!-- Valor final para el formulario tradicional (FormData / submit nativo) -->
	<!-- Se usa ?? '' por si el value es null, para que el input reciba un string vacío -->
	<input type="hidden" {name} value={value ?? ''} />
</div>

<style>
	.contenedor {
		display: flex;
		flex-wrap: wrap;
		gap: var(--y);
	}
</style>
