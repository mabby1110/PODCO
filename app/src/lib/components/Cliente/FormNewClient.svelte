<script lang="ts">
	import FormSelectMotivo from '../FormSelectMotivo.svelte';
	import { motivosProspeccion } from '$lib';
	import { page } from '$app/state';
	import FormInputAddContact from '$lib/components/FormInputAddContact.svelte';
	let {
		isDuplicate = $bindable()
	}: {
		isDuplicate: boolean;
	} = $props();
	let { clientes, agentes } = $derived(page.data);

	// --- Pickers separados ---
	let razon_social = $state('');
	let ubicacion = $state('');
	let matches = $derived(
		razon_social.trim().length > 0
			? (clientes?.filter((c: any) =>
					c.razon_social.toLowerCase().includes(razon_social.toLowerCase().trim())
				) ?? [])
			: []
	);
	
	$effect(() => {
		isDuplicate = razon_social.trim() === '' || matches.length > 0;
	});
</script>

<div class="form-content">
	<label>
		<span>Razon social (cliente nuevo)</span>
		<input
			name="razon_social"
			bind:value={razon_social}
			placeholder="BMS Componentes y Equipos Industriales S.A. de C.V."
			required
		/>
	</label>

	{#if matches.length > 0}
		<ul class="matches">
			{#each matches as match}
				<li
					class:exact={match.razon_social.toLowerCase().trim() ===
						razon_social.toLowerCase().trim()}
				>
					{match.razon_social}
				</li>
			{/each}
		</ul>
	{/if}

	<FormSelectMotivo title="Tipo de prospeccion" name={'tipo_prospeccion'} list={motivosProspeccion} />

	<label>
		<span>Ubicacion</span>
		<textarea
			name="ubicacion"
			id="ubicacion"
			bind:value={ubicacion}
			required
			rows="3"
			placeholder="copiar y pegar de google maps ej. Antonio Bravo 128, Las Liebres, 45623 San Pedro Tlaquepaque, Jal."
		></textarea>
	</label>

	<FormInputAddContact />
</div>

<style>
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
