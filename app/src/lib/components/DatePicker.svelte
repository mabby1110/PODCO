<script lang="ts">
	import { addMinutes } from '$lib/utils/agenda';
	const { title = '' } = $props();
	let fecha = $state('');
	let duracion = $state(20);
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

	function setCustomEnd(fechaCompromiso: Date, duracion: number = 10) {
		const next = addMinutes(new Date(fechaCompromiso), duracion);

		const yyyy = next.getFullYear();
		const mm = String(next.getMonth() + 1).padStart(2, '0');
		const dd = String(next.getDate()).padStart(2, '0');
		const hh = String(next.getHours()).padStart(2, '0');
		const mi = String(next.getMinutes()).padStart(2, '0');

		return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
	}

	function generarHoras() {
		const horas: string[] = [];
		let actual = 8 * 60;
		const limite = 18 * 60;

		const paso = duracion && duracion > 0 ? duracion : 30;

		while (actual <= limite) {
			const hh = String(Math.floor(actual / 60)).padStart(2, '0');
			const mm = String(actual % 60).padStart(2, '0');
			horas.push(`${hh}:${mm}`);

			actual += paso; // <-- Usamos la variable segura aquí
		}

		return horas;
	}

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

<label>
	{#if title}
		<p>{title}</p>
	{/if}

	<div class="datetime-split">
		<div class="datetime-item">
			<span>Fecha</span>
			<!-- <input type="date" bind:value={fecha} min={getToday()} required /> -->
			<input class="butter" type="date" bind:value={fecha} required />
		</div>
		<div class="datetime-item">
			<span>Hora</span>
			<select class="butter" bind:value={hora} required>
				{#each generarHoras() as h}
					<option value={h}>{h}</option>
				{/each}
			</select>
		</div>
		<div class="datetime-item">
			<span>Duración (minutos)</span>
			<input class="butter" type="number" bind:value={duracion} required />
		</div>
	</div>

	<input type="hidden" name="inicio" bind:value={inicio} />
	<input type="hidden" name="fin" bind:value={fin} />
</label>

<style>
	label {
		display: flex;
		flex-direction: column;
		gap: var(--a);
		width: 100%;
	}
	.datetime-split {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}
	.datetime-item {
		display: flex;
		flex-direction: column;
		gap: var(--a);
	}
	span {
		font-size: smaller;
		color: var(--color-muted);
	}
</style>
