<script lang="ts">
	import Searchbar from '$lib/components/Searchbar.svelte';
	import FormSelectInput from '$lib/components/FormSelectMotivo.svelte';
	import { motivosOportunidad } from '$lib';
	import FormOptionalInput from '$lib/components/FormOptionalInput.svelte';
	import FormInput from '$lib/components/FormInput.svelte';
	import FormSelectAgente from '../FormSelectAgente.svelte';
	import { filtrarPorAgente } from '$lib/utils/util';
	import { page } from '$app/state';
	import DatePicker from '../DatePicker.svelte';
	
	
	let { op=false }: { op?: boolean } = $props();
	
	let data = $derived(page.data);
	let { cliente } = $derived(page.data);
	let clientes = $derived(data.clientes ?? []);
	
	let selectedClient = $state(cliente?cliente:null);
	let necesidad = $state('');
	let potencial_venta = $state('');
	let objetivo = $state('');
	let requisitos = $state('');
	
	let agenteSeleccionado = $derived(data.profile?.isAdmin?'':data.profile.id);
	console.log(cliente);
	console.log('agenteSeleccionado', agenteSeleccionado);
	let clientesFiltrados = $derived(
		data.profile?.isAdmin
			? agenteSeleccionado
				? filtrarPorAgente(clientes, agenteSeleccionado)
				: clientes
			: filtrarPorAgente(clientes, String(data.profile?.id))
	);
	$effect(() => {
		if(!cliente) {
			agenteSeleccionado;
			selectedClient = null;
		}
	});
</script>

<div class="form-content">
	<div class="form-group">
		<FormSelectInput list={motivosOportunidad} disableCustom={false}/>
		<FormSelectAgente agentes={data.agentes} bind:selected={agenteSeleccionado} />
	</div>

	<Searchbar
		data={clientesFiltrados}
		keyColumns={['razon_social']}
		bind:selectedItem={selectedClient}
	/>

	<FormInput
		label="Necesidad"
		name="necesidad"
		bind:value={necesidad}
		placeholder="Areas de oportunidad"
		type="textarea"
		required
	/>
	<FormInput
		label="Potencial de venta"
		name="potencial_venta"
		bind:value={potencial_venta}
		placeholder="Servicios o productos que tiene mayor probabilidad de venta"
		type="textarea"
		required
	/>
	<FormInput
		label="Objetivo"
		name="objetivo"
		bind:value={objetivo}
		placeholder="Define objetivos clave para concretar la venta"
		type="textarea"
		required
	/>
	<div class="form-group">
		<FormOptionalInput title="+Agregar requisitos">
			<FormInput
				label="Requisitos"
				name="requisitos"
				bind:value={requisitos}
				placeholder="Viáticos, hospedaje, transporte, permisos de acceso, equipo de seguridad, herramientas especiales u otros requerimientos operativos"
				type="textarea"
				required
			/>
		</FormOptionalInput>
	</div>
	
	<DatePicker />

	{#if selectedClient}
		<input type="hidden" name="id_cliente" value={selectedClient?.id} required />
	{/if}
	<input type="hidden" name="fase" value={op ? 2 : 1} />
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
	input {
		padding: 0.5rem;
		border: 1px solid #d1d5db;
		border-radius: 4px;
	}
</style>
