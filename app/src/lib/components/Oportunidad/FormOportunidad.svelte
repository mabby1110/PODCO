<script lang="ts">
	import Searchbar from '$lib/components/Searchbar.svelte';
	import FormSelectInput from '$lib/components/FormSelectMotivo.svelte';
	import { motivosOportunidad } from '$lib';
	import FormInput from '$lib/components/FormInput.svelte';
	import FormSelectAgente from '../FormSelectAgente.svelte';
	import { filtrarPorAgente } from '$lib/utils/util';
	import { page } from '$app/state';
	import DatePicker from '../DatePicker.svelte';
	import FormConditionalInput from '../FormConditionalInput.svelte';
	import { opModalStore } from '$lib/stores/opModalStore.svelte';
	import FormOptionalInput from '../FormOptionalInput.svelte';

	let data = $derived(page.data);

	let { isValid = $bindable() } = $props();
	let { cliente } = $derived(page.data);
	let clientes = $derived(data.clientes ?? []);

	let necesidades = $state('');
	let potencial_venta = $state('');
	let objetivo = $state(opModalStore.objetivo || '');
	let observaciones = $state('');

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
		if (!cliente) {
			selectedAgent;
			selectedClient = null;
		}
	});
	$effect(() => {
		const baseValid = !!(objetivo && (selectedClient || newCLient) && selectedAgent);

		if (isOpen) {
			isValid = baseValid && !!(necesidades && potencial_venta);
		} else {
			isValid = baseValid;
		}
	});
</script>

<div class="form-content">
	<div class="form-group">
		<FormSelectInput list={motivosOportunidad} />
		<FormSelectAgente bind:selected={selectedAgent} />
	</div>

	<Searchbar
		data={clientesFiltrados}
		keyColumns={['razon_social']}
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
			<FormInput
				label="Potencial de venta"
				name="potencial_venta"
				bind:value={potencial_venta}
				placeholder="Producto o servicio que tiene mayor probabilidad de venta"
				type="textarea"
				required
			/>
		</div>
	</FormConditionalInput>

	<div class="form-group">
		<DatePicker title="Fecha de seguimiento" />
	</div>
	{#if isOpen}
		<input type="hidden" name="fecha_analisis" value={new Date().toISOString()} />
	{/if}

	{#if selectedClient}
		<input type="hidden" name="id_cliente" value={selectedClient?.id} required />
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
	.form-group {
		width: 100%;
		display: flex;
		flex-wrap: wrap;
		gap: var(--a);
	}
</style>
