<script lang="ts">
	import { addMinutes } from '$lib/utils/agenda';

	// props (Svelte 5)
	const { duration = 10, title = 'Inicio de actividad' } = $props<{
		duration?: number;
		title: string;
	}>();

	// --- Pickers separados ---
	let fecha = $state('');
	let hora = $state('10:00');
	let inicio = $state('');
	let fin = $state('');

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

	function getToday() {
		const t = new Date();
		return t.toISOString().slice(0, 10);
	}

	function setCustomEnd(fechaCompromiso: Date) {
		const next = addMinutes(new Date(fechaCompromiso), duration);

		const yyyy = next.getFullYear();
		const mm = String(next.getMonth() + 1).padStart(2, '0');
		const dd = String(next.getDate()).padStart(2, '0');
		const hh = String(next.getHours()).padStart(2, '0');
		const mi = String(next.getMinutes()).padStart(2, '0');

		return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
	}

	function generarHoras() {
		const horas: string[] = [];
		let actual = 8 * 60; // 08:00
		const limite = 18 * 60; // 18:00

		while (actual <= limite) {
			const hh = String(Math.floor(actual / 60)).padStart(2, '0');
			const mm = String(actual % 60).padStart(2, '0');
			horas.push(`${hh}:${mm}`);
			actual += duration;
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

<label>
	<span>{title}</span>

	<div class="datetime-split">
		<!-- <input class="butter" type="date" bind:value={fecha} min={getToday()} required /> -->
		<input class="butter" type="date" bind:value={fecha} required />

		<select class="butter" bind:value={hora} required>
			{#each generarHoras() as h}
				<option value={h}>{h}</option>
			{/each}
		</select>
	</div>

	<input type="hidden" name="inicio" bind:value={inicio} />
	<input type="hidden" name="fin" bind:value={fin} />
</label>

<style>
	.butter {
		background-color: var(--color-secondary);
	}
	label {
		display: flex;
		flex-direction: column;
		gap: var(--a);
		width: 100%;
	}
	span {
		font-size: 20px;
		cursor: pointer;
	}
</style>
