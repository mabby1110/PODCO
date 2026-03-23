<script lang="ts">
	import Searchbar from '$lib/components/Searchbar.svelte';
	import { addMinutes } from '$lib/utils/agenda';
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

	let clientes = $derived(data.clientes ?? []);

	let selectedClient = $state(null);
	let necesidad = $state('');
	let potencial_venta = $state('');
	let objetivo = $state('');
	let requisitos = $state('');
	let fecha = $state('');
	let hora = $state('08:00');
	let inicio = $state('');
	let fin = $state('');
	let duracion = $state(20);
	let agenteSeleccionado = $state<string>('');

	let clientesFiltrados = $derived(
		data.profile?.isAdmin
			? agenteSeleccionado
				? filtrarPorAgente(clientes, agenteSeleccionado)
				: clientes
			: filtrarPorAgente(clientes, String(data.profile?.id))
	);

	function setCustomEnd(fechaCompromiso: Date, duracion: number = 10) {
		const next = addMinutes(new Date(fechaCompromiso), duracion);

		const yyyy = next.getFullYear();
		const mm = String(next.getMonth() + 1).padStart(2, '0');
		const dd = String(next.getDate()).padStart(2, '0');
		const hh = String(next.getHours()).padStart(2, '0');
		const mi = String(next.getMinutes()).padStart(2, '0');

		return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
	}
	$effect(() => {
		agenteSeleccionado;
		selectedClient = null;
	});
	$effect(() => {
		if (fecha && hora) {
			const base = `${fecha} ${hora}`;
			inicio = base;
			fin = setCustomEnd(new Date(`${fecha}T${hora}`), duracion);
		} else {
			inicio = '';
			fin = '';
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

	<DatePicker />

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
