<script lang="ts">
	import { motivosProspeccion } from '$lib';
	import { page } from '$app/state';
	import FormInputAddContact from '$lib/components/Cliente/FormInputAddContact.svelte';
	import FormOptionalInput from '../App/form/FormOptionalInput.svelte';
	import FormInput from '../App/form/FormInput.svelte';
	import FormSelectMotivo from '../App/form/FormSelectMotivo.svelte';

	let {
		isDuplicate = $bindable()
	}: {
		isDuplicate: boolean;
	} = $props();

	let { clientes } = $derived(page.data);

	const sectores = [...new Set(clientes.map((item) => item.sector))];
    
	// --- Único picker para la búsqueda ---
	let nombre_comercial = $state('');
	let ubicacion = $state('');
	let giro_comercial = $state('');
	let pagina_web = $state('');
	let estado = $state('');
	let ciudad = $state('');

	// --- Lógica de filtrado reactivo ---
	let matches = $derived.by(() => {
		const query = nombre_comercial.trim().toLowerCase();

		// Si el campo está vacío, no buscamos nada
		if (!query) return [];

		return (
			clientes?.filter((c: any) => {
				// Verificamos si el texto ingresado coincide con cualquiera de los dos campos
				const matchRazon = c.razon_social?.toLowerCase().includes(query) ?? false;
				const matchComercial = c.nombre_comercial?.toLowerCase().includes(query) ?? false;

				return matchRazon || matchComercial;
			}) ?? []
		);
	});

	// Validamos duplicados
	$effect(() => {
		isDuplicate = nombre_comercial.trim() === '' || matches.length > 0;
	});
</script>

<div class="form-content">
	<label>
		<span>Cliente (Nombre comercial o Razón social)</span>
		<input
			name="nombre_comercial"
			bind:value={nombre_comercial}
			placeholder="Ej. Nestlé / BMS"
			required
		/>
	</label>

	{#if matches.length > 0}
		<ul class="matches">
			{#each matches as match}
				<li
					class:exact={match.razon_social?.toLowerCase().trim() ===
						nombre_comercial.toLowerCase().trim() ||
						match.nombre_comercial?.toLowerCase().trim() === nombre_comercial.toLowerCase().trim()}
				>
					{match.nombre_comercial ?? match.razon_social}
					<br />
					<small style="font-style: italic;">Razon social: {match.razon_social}</small>
				</li>
			{/each}
		</ul>
	{/if}

	<FormSelectMotivo
		title="Tipo de prospeccion"
		name={'tipo_prospeccion'}
		list={motivosProspeccion}
	/>

	<label>
		<span>Ubicacion</span>
		<textarea
			name="ubicacion"
			id="ubicacion"
			bind:value={ubicacion}
			required
			rows="3"
			placeholder="copiar y pegar de google maps plus code o ej. Antonio Bravo 128, Las Liebres, 45623 San Pedro Tlaquepaque, Jal."
		></textarea>
	</label>

	<FormInput
		label="Estado"
		name="estado"
		type="text"
		placeholder="Estado de la republica"
		required
		bind:value={estado}
	/>
	<div class="form-group">
		<FormOptionalInput title="+Ciudad">
			<FormInput
				label="Ciudad"
				name="ciudad"
				type="text"
				placeholder="ciudad o municipio"
				required
				bind:value={ciudad}
			/>
		</FormOptionalInput>
		<FormOptionalInput title="+Sector">
			<FormSelectMotivo title="Sector" name="sector" list={sectores} disableCustom={false} />
		</FormOptionalInput>
		<FormOptionalInput title="+Giro Comercial">
			<FormInput
				label="Giro Comercial"
				name="giro_comercial"
				type="text"
				placeholder="Describe que hace la empresa"
				required
				bind:value={giro_comercial}
			/>
		</FormOptionalInput>
		<FormOptionalInput title="+Página web">
			<FormInput
				label="Página web"
				name="pagina_web"
				type="text"
				placeholder="Sitio web de la empresa"
				required
				bind:value={pagina_web}
			/>
		</FormOptionalInput>
	</div>

	<FormInputAddContact />
</div>

<style>
	.matches li.exact {
		color: #d32f2f;
		background-color: #ffebee;
		font-weight: bold;
	}
	.form-content {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: var(--b);
		border-radius: 12px;
		border: 1px solid var(--color-contrast);
		padding: var(--b);
	}
	.matches {
		list-style: none;
		margin: -0.5rem 0 0;
		padding: 0;
		font-size: 0.85rem;
	}
	.matches li {
		padding: 0.2rem 0;
		color: #555;
	}

	.matches li.exact {
		color: #c0392b;
		font-weight: 600;
	}
</style>
