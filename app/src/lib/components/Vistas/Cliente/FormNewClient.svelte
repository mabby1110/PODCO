<script lang="ts">
	import { motivosProspeccion } from '$lib';
	import { page } from '$app/state';
	import FormSelectMotivo from '$lib/components/Formularios/FormSelectMotivo.svelte';
	import FormInput from '$lib/components/Formularios/FormInput.svelte';
	import FormOptionalInput from '$lib/components/Formularios/FormOptionalInput.svelte';
	import FormInputAddContact from './FormInputAddContact.svelte';

	let {
		isDuplicate = $bindable()
	}: {
		isDuplicate: boolean;
	} = $props();

	let { clientes } = $derived(page.data);
	console.log(clientes)
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
	$effect(()=>console.log(matches));
</script>

<div class="form-content milk">
	<section>
		<div class="section-header">
			<h3>Cliente</h3>
		</div>
		<div class="section-block">
			<input
				name="nombre_comercial"
				bind:value={nombre_comercial}
				placeholder="Nombre comercial o Razón social"
				required
			/>
		</div>
	</section>

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
					<small style="font-style: italic;">Agente: {match.agentes.nombre}</small>
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

	<section>
		<div class="section-header">
			<h3>Ubicacion</h3>
		</div>
		<div class="section-block">
			<textarea
				name="ubicacion"
				id="ubicacion"
				bind:value={ubicacion}
				required
				rows="3"
				placeholder="copiar y pegar de google maps plus code o ej. Antonio Bravo 128, Las Liebres, 45623 San Pedro Tlaquepaque, Jal."
			></textarea>
		</div>
	</section>

	<FormInputAddContact />

	<div class="form-group">
		<FormOptionalInput title="+Estado">
			<FormInput
				label="Estado"
				name="estado"
				type="text"
				placeholder="Estado de la republica"
				required
				bind:value={estado}
			/>
		</FormOptionalInput>
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
		padding: var(--a);
	}
	.matches {
		list-style: none;
		margin: -0.5rem 0 0;
		padding: 0;
		font-size: 0.85rem;
		max-height: var(--h);
		overflow: auto;
	}
	.matches li {
		padding: 0.2rem 0;
		color: #555;
	}

	.matches li.exact {
		color: #c0392b;
		font-weight: 600;
	}
	.form-group {
		display: flex;
		flex-wrap: wrap;
		gap: var(--a);
	}
</style>
