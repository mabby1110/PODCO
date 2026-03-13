<script lang="ts">
	import { enhance } from '$app/forms';
	import { appState } from '$lib/stores/appState.svelte';
	import { addMinutes } from '$lib/utils/agenda';
	import { profile } from '$lib/stores/profileStore.svelte';
	import FormInputAddContact from './FormInputAddContact.svelte';
	import FormSelectMotivo from './FormSelectMotivo.svelte';
	import { motivosProspeccion } from '$lib';
	import FormSelectAgente from './FormSelectAgente.svelte';
	import { page } from '$app/state';

	let { clientes, agentes } = $derived(page.data);
	let selectedDataItem = $state(null);

	// --- Pickers separados ---
	let razon_social = $state('');
	let ubicacion = $state('');
	let fecha = $state<string>('');
	let hora = $state<string>('08:00');
	let inicio = $state<string>('');
	let fin = $state<string>('');
	let matches = $derived(
		razon_social.trim().length > 0
			? (clientes?.filter((c: any) =>
					c.razon_social.toLowerCase().includes(razon_social.toLowerCase().trim())
				) ?? [])
			: []
	);

	let isDuplicate = $derived(razon_social.trim() === '' || matches.length > 0);

	function getToday() {
		const t = new Date();
		return t.toISOString().slice(0, 10);
	}

	function setCustomEnd(fechaCompromiso: Date) {
		const next = addMinutes(new Date(fechaCompromiso), 10);

		const yyyy = next.getFullYear();
		const mm = String(next.getMonth() + 1).padStart(2, '0');
		const dd = String(next.getDate()).padStart(2, '0');
		const hh = String(next.getHours()).padStart(2, '0');
		const mi = String(next.getMinutes()).padStart(2, '0');

		return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
	}

	function generarHoras() {
		const horas = [];
		let actual = 8 * 60; // 08:00
		const limite = 18 * 60; // 18:00

		while (actual <= limite) {
			const hh = String(Math.floor(actual / 60)).padStart(2, '0');
			const mm = String(actual % 60).padStart(2, '0');
			horas.push(`${hh}:${mm}`);
			actual += 10;
		}

		return horas;
	}

	$effect(() => {
		if (fecha && hora) {
			const base = `${fecha} ${hora}`;
			inicio = base;
			fin = setCustomEnd(new Date(`${fecha}T${hora}`));
		} else {
			inicio = '';
			fin = '';
		}
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

	<FormSelectMotivo title="Tipo de prospeccion" list={motivosProspeccion} />

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
