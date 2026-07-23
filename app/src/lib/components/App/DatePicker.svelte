<script lang="ts">
	import { addMinutes } from '$lib/utils/agenda';
	import { procesarDatosReactivos } from '$lib/utils/filtro';
	import { page } from '$app/stores';
	import DatePickerCard from './DatePickerCard.svelte';

	let {
		title = ''
	} = $props<{
		title?: string;
	}>();

	let inicio = $state('');
	let fin = $state('');
	let oportunidades = $derived($page.data.oportunidades || []);
	let actividades = $derived($page.data.actividades || []);

	let allActivities = $derived([...oportunidades, ...actividades]);
	let currentRoute = $derived($page.url.pathname);

	const listaAgrupada = $derived.by(() => procesarDatosReactivos(allActivities, currentRoute));

	const eventList = $derived(listaAgrupada.flatMap((agrupacion: any) => agrupacion.elementos));

	// Modificación: Obtener fecha local actual en formato YYYY-MM-DD
	const offset = new Date().getTimezoneOffset() * 60000;
	let fecha = $state(new Date(Date.now() - offset).toISOString().slice(0, 10));

	let duracion = $state<number | undefined>(undefined);
	let hora = $state('');

	let datepicker = $state<HTMLElement | null>(null);
	$effect(() => {
		if (fecha != '' && datepicker) {
			datepicker.scrollIntoView({
				behavior: 'smooth',
				block: 'center'
			});
		}
	});
	$effect(() => {
		if (fecha && hora && duracion) {
			// Creamos un objeto Date uniendo la fecha y la hora seleccionada
			const fechaHora = new Date(`${fecha}T${hora}:00`);

			// Asignamos a las variables bindable
			inicio = fechaHora.toISOString();
			fin = setCustomEnd(fechaHora, duracion);
		} else {
			inicio = '';
			fin = '';
		}
	});

	function setCustomEnd(fechaCompromiso: Date, min: number = 10) {
		const next = addMinutes(fechaCompromiso, min);
		return next.toISOString();
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

	let eventosDelDia = $derived.by(() => {
		if (!fecha || !eventList || eventList.length === 0) return [];

		const parts = fecha.split('-');
		const targetYear = parseInt(parts[0]);
		const targetMonth = parseInt(parts[1]) - 1;
		const targetDate = parseInt(parts[2]);

		const filtrados = eventList.filter((e) => {
			const d = new Date(e.inicio);
			return (
				d.getFullYear() === targetYear && d.getMonth() === targetMonth && d.getDate() === targetDate
			);
		});

		const gruposPorHora: Record<string, any[]> = {};
		filtrados.forEach((ev) => {
			const timeKey = new Date(ev.inicio).getTime().toString();
			if (!gruposPorHora[timeKey]) gruposPorHora[timeKey] = [];
			gruposPorHora[timeKey].push(ev);
		});

		const procesados: any[] = [];
		for (const key in gruposPorHora) {
			const grupo = gruposPorHora[key];
			const totalConcurrentes = grupo.length;

			grupo.forEach((evento, index) => {
				const { top, height } = getLayoutProps(evento.inicio, evento.fin);
				procesados.push({
					...evento,
					_top: top,
					_height: height,
					_width: 100 / totalConcurrentes,
					_left: (100 / totalConcurrentes) * index
				});
			});
		}

		return procesados;
	});

	const DAY_START_MIN = 8 * 60;
	const DAY_END_MIN = 18 * 60;
	const DAY_TOTAL_MIN = DAY_END_MIN - DAY_START_MIN;

	function getLayoutProps(inicioDate: string, finDate: string) {
		const startD = new Date(inicioDate);
		const endD = new Date(finDate);

		const startMin = startD.getHours() * 60 + startD.getMinutes();
		const endMin = endD.getHours() * 60 + endD.getMinutes();

		const clampedStart = Math.max(DAY_START_MIN, Math.min(startMin, DAY_END_MIN));
		const clampedEnd = Math.max(DAY_START_MIN, Math.min(endMin, DAY_END_MIN));

		const top = ((clampedStart - DAY_START_MIN) / DAY_TOTAL_MIN) * 100;
		const height = ((clampedEnd - clampedStart) / DAY_TOTAL_MIN) * 100;

		return { top, height };
	}
</script>

<div class="datepicker">
	<input type="hidden" name="inicio" value={inicio} />
	<input type="hidden" name="fin" value={fin} />

	{#if title}
		<h3>{title}</h3>
	{/if}

	<div class="datetime-split">
		<div class="datetime-item">
			<span>Fecha</span>
			<input class="butter" type="date" bind:value={fecha} required />
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
		<div class="datetime-item">
			<span>Hora</span>
			<select class="butter" bind:value={hora} required>
				<option value="" disabled selected>inicio</option>
				{#each horasGeneradas as h}
					<option value={h}>{h}</option>
				{/each}
			</select>
		</div>
	</div>

	{#if fecha && duracion}
		<div class="lane-container" bind:this={datepicker}>
			<span class="lane-title">Disponibilidad del {fecha}</span>

			<div class="lane">
				<div class="lane-grid">
					{#each Array.from({ length: 11 }, (_, i) => i + 8) as hr, i}
						<div class="lane-hour" style="top: {i * 10}%;">
							<span class="hour-label">{hr}:00</span>
							<div class="hour-line"></div>
						</div>
					{/each}
				</div>

				<div class="lane-events">
					{#each eventosDelDia.reverse() as evento}
						<div
							class="event-block"
							style="top: {evento._top}%; height: {evento._height}%; width: {evento._width}%; left: {evento._left}%;"
						>
							<DatePickerCard event={evento} />
						</div>
					{/each}

					{#if hora && duracion}
						{@const pre = getLayoutProps(inicio, fin)}
						<div class="new-event" style="top: {pre.top}%; height: {pre.height}%;">
							<p>✨ Nuevo evento</p>
						</div>
					{/if}
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.datepicker {
		display: flex;
		flex-wrap: wrap;
		gap: var(--a, 16px);
	}
	.datepicker h3 {
		width: 100%;
	}
	.datetime-split {
		display: flex;
		width: 100%;
		flex-wrap: wrap;
		gap: var(--a, 16px);
	}
	.datetime-item {
		display: flex;
		flex-direction: column;
		flex-grow: 1;
		font-size: smaller;
		color: var(--color-muted);
	}

	/* Estilos del Carril (Mini Agenda) */
	.lane-container {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 8px;
		min-height: 30vh;
	}
	.lane-title {
		font-size: smaller;
	}
	.lane {
		position: relative;
		min-height: 50vh;

		border: 1px solid var(--color-secondary);
		border-radius: 8px;
		background: var(--color-surface);
		overflow: hidden;
		display: flex;
	}
	.lane-grid {
		position: absolute;
		top: 0;
		bottom: 0;
		left: 0;
		right: 0;
		width: 100%;
	}
	.lane-hour {
		position: absolute;
		left: 0;
		right: 0;
		display: flex;
	}
	.hour-label {
		width: 45px;
		font-size: smaller;
		color: var(--color-muted);
		text-align: right;
		padding-right: 8px;
		margin: 0;
	}
	.hour-line {
		flex-grow: 1;
		border-top: 1px dashed var(--color-secondary, #eaeaea);
	}
	.lane-events {
		position: absolute;
		top: 0;
		bottom: 0;
		left: 45px;
		right: 0;
	}
	.event-block {
		position: absolute;
		display: flex;
		align-items: flex-start;
		padding: 2px 4px;
		box-sizing: border-box;
		min-height: 15px;
	}
	.new-event {
		position: absolute;
		background-color: var(--color-success);
		border-radius: 4px;
		display: flex;
		align-items: flex-start;
		padding: 2px 4px;
		box-sizing: border-box;
		min-height: fit-content;
		width: 100%;
		z-index: 99;
	}
</style>
