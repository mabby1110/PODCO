<script lang="ts">
	import { addMinutes } from '$lib/utils/agenda';

	const { title = '' } = $props();

	let fecha = $state('');
	let duracion = $state(undefined);
	let hora = $state('');

	let inicio = $derived(fecha && hora ? `${fecha} ${hora}` : '');
	let fin = $derived(fecha && hora ? setCustomEnd(new Date(`${fecha}T${hora}`), duracion) : '');

	function setCustomEnd(fechaCompromiso: Date, min: number = 10) {
		const next = addMinutes(fechaCompromiso, min);

		const yyyy = next.getFullYear();
		const mm = String(next.getMonth() + 1).padStart(2, '0');
		const dd = String(next.getDate()).padStart(2, '0');
		const hh = String(next.getHours()).padStart(2, '0');
		const mi = String(next.getMinutes()).padStart(2, '0');

		return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
	}

	const horasGeneradas = (() => {
		const horas: string[] = [];
		let actual = 8 * 60;
		const limite = 18 * 60;
		const paso = 10;

		while (actual <= limite) {
			const hh = String(Math.floor(actual / 60)).padStart(2, '0');
			const mm = String(actual % 60).padStart(2, '0');
			horas.push(`${hh}:${mm}`);
			actual += paso;
		}
		return horas;
	})();

	const opcionesDuracion = [
		{ label: '10 minutos', value: 10 },
		{ label: '20 minutos', value: 20 },
		{ label: '30 minutos', value: 30 },
		...Array.from({ length: 10 }, (_, i) => ({
			label: `${i + 1} hora${i > 0 ? 's' : ''}`,
			value: (i + 1) * 60
		}))
	];
</script>

<div class="datepicker">
	{#if title}
		<h3>{title}</h3>
	{/if}

	<div class="datetime-split">
		<div class="datetime-item">
			<span>Fecha</span>
			<input class="butter" type="date" bind:value={fecha} required />
		</div>
		<div class="datetime-item">
			<span>Hora</span>
			<select class="butter" bind:value={hora} required>
				<option value="" disabled selected>inicio</option>
				{#each horasGeneradas as h}
					<option value={h}>{h}</option>
				{/each}
			</select>
		</div>
		<div class="datetime-item">
			<span>Duración</span>
			<select class="butter" bind:value={duracion} required>
				<option value="" disabled selected>Duración</option>
				{#each opcionesDuracion as opcion}
					<option value={opcion.value}>{opcion.label}</option>
				{/each}
			</select>
		</div>
	</div>

	<input type="hidden" name="inicio" value={inicio} />
	<input type="hidden" name="fin" value={fin} />
</div>

<style>
	.datepicker {
		display: flex;
		flex-wrap: wrap;
		gap: var(--a);
	}
	.datepicker h3 {
		width: 100%;
	}
	.datetime-split {
		display: flex;
		gap: var(--a);
	}
	.datetime-item {
		display: flex;
		flex-direction: column;
		flex-grow: 1;
	}
</style>
