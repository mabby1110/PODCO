<script lang="ts">
	import { motivosOportunidad } from '$lib';
	import { filtrarPorAgente } from '$lib/utils/util';
	import { page } from '$app/state';
	import { opModalStore } from '$lib/stores/opModalStore.svelte';
	import FormSelectMotivo from '$lib/components/Formularios/FormSelectMotivo.svelte';
	import FormSelectAgente from '$lib/components/Formularios/FormSelectAgente.svelte';
	import FormInput from '$lib/components/Formularios/FormInput.svelte';
	import FormOptionalInput from '$lib/components/Formularios/FormOptionalInput.svelte';
	import FormConditionalInput from '$lib/components/Formularios/FormConditionalInput.svelte';
	import DatePicker from '$lib/components/Formularios/DatePicker.svelte';
	import Searchbar from './Searchbar.svelte';

	let data = $derived(page.data);

	let { isValid = $bindable() } = $props();
	let { cliente } = $derived(page.data);
	let clientes = $derived(data.clientes ?? []);

	let necesidades = $state('');
	let objetivo = $state('');
	let observaciones = $state(opModalStore.observaciones || '');

	let isOpen = $state(false);

	let fase = $derived(isOpen ? 2 : 1);
	let selectedAgent = $derived(data.profile?.isAdmin ? '' : data.profile.id);
	let selectedClient = $derived(cliente ? cliente : null);
	let newCLient = $state(false);
	let clientesFiltrados = $derived(
		data.profile?.isAdmin
			? selectedAgent
				? filtrarPorAgente(clientes, selectedAgent)
				: clientes
			: filtrarPorAgente(clientes, String(data.profile?.id))
	);

	$effect(() => {
		selectedAgent;
		selectedClient = null;
	});
	$effect(() => {
		const baseValid = !!(objetivo && (selectedClient || newCLient) && selectedAgent);

		if (isOpen) {
			isValid = baseValid && necesidades;
		} else {
			isValid = baseValid;
		}
	});
</script>

<div class="form-content">
	<div class="form-group">
		<FormSelectMotivo list={motivosOportunidad} />
		<FormSelectAgente bind:selected={selectedAgent} />
	</div>

	<Searchbar
		data={clientesFiltrados}
		keyColumns={['razon_social', 'nombre_comercial']}
		bind:selectedItem={selectedClient}
		bind:newCLient
	/>

	<FormInput
		label="Objetivo"
		name="objetivo"
		bind:value={objetivo}
		placeholder="Resultado concreto a conseguir"
		type="textarea"
		hint="ej. levantamiento técnico en sitio,  o presentar cotización"
		required
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
	<FormConditionalInput bind:isOpen titleOpen="+Necesidad detectada">
		<div class="form-group">
			<FormInput
				label="Necesidad"
				name="necesidades"
				bind:value={necesidades}
				placeholder="Requerimiento técnico u operacional detectados"
				type="textarea"
				required
			/>
		</div>
	</FormConditionalInput>

	<div class="form-group">
		<DatePicker title="Fecha de seguimiento" />
	</div>

	{#if selectedClient}
		<input type="hidden" name="id_cliente" value={selectedClient?.id} required />
	{/if}
	{#if fase == 2}
		<input type="hidden" name="fecha_analisis" value={new Date().toISOString()} />
	{/if}
	<input type="hidden" name="fase" bind:value={fase} />
</div>

<style>
	.form-content {
		width: 100%;
		display: flex;
		flex-wrap: wrap;
		gap: var(--b);
	}
</style>
