<script lang="ts">
	import { page } from '$app/state';
	import { categoriasOportunidad } from '$lib';
	import Filtro from '$lib/components/Acciones/Filtro.svelte';
	import FiltroAgente from '$lib/components/Acciones/FiltroAgente.svelte';
	import ModList from '$lib/components/Acciones/ModList.svelte';
	import PanelFiltros from '$lib/components/Acciones/PanelFiltros.svelte';
	import Vista from '$lib/components/Tarjetas/Vista.svelte';
	import { appState } from '$lib/stores/appState.svelte';
	import { calendarStore } from '$lib/stores/calendarStore.svelte';
	import { profile } from '$lib/stores/profileStore.svelte';
	import { formatWeekRange, getWeekDates } from '$lib/utils/agenda';
	import { obtenerDatosFiltrados } from '$lib/utils/filtro';
	import { extraerColumnas, filterData, sortData } from '$lib/utils/ModList';
	import TarjetaCalendarioAnual from './TarjetaCalendarioAnual.svelte';
	import { onMount } from 'svelte';

	let { oportunidades } = $derived(page.data);
	let currentRoute = $derived(page.url.pathname);

	// Convertido a $state para soportar bind:lista
	let lista = $state(oportunidades);
	let columnasDinamicas = $derived(extraerColumnas(oportunidades));

	$effect(() => {
		lista = oportunidades;
	});

	let lista_ordenada = $derived(sortData(lista, currentRoute));
	let lista_filtrada = $derived(filterData(lista_ordenada, currentRoute));

	const PX_POR_DIA = 8;
	const MESES = [
		'Ene',
		'Feb',
		'Mar',
		'Abr',
		'May',
		'Jun',
		'Jul',
		'Ago',
		'Sep',
		'Oct',
		'Nov',
		'Dic'
	];

	const anioActual = new Date().getFullYear();
	const getDiasMes = (mes: number, anio: number) => new Date(anio, mes + 1, 0).getDate();

	let mesesOcultos = $state<number[]>([]);
	let contenedor = $state<HTMLElement>();
	const weekDates = $derived(getWeekDates(calendarStore.weekOffset));
	const weekRangeText = $derived(formatWeekRange(weekDates));
	function ocultarMes(indice: number) {
		if (!mesesOcultos.includes(indice)) {
			mesesOcultos = [...mesesOcultos, indice];
		}
	}

	const columnasMeses = $derived(
		MESES.map((nombre, indice) => ({
			nombre,
			indice,
			ancho: getDiasMes(indice, anioActual) * PX_POR_DIA,
			visible: !mesesOcultos.includes(indice)
		})).filter((mes) => mes.visible)
	);

	const inicioAnio = new Date(anioActual, 0, 1).getTime();
	const finAnio = new Date(anioActual, 11, 31, 23, 59, 59, 999).getTime();

	function calcularPosicionX(timestamp: number) {
		const fecha = new Date(Math.max(inicioAnio, Math.min(timestamp, finAnio)));
		const mesObjetivo = fecha.getMonth();
		let x = 0;

		for (let i = 0; i <= mesObjetivo; i++) {
			if (!mesesOcultos.includes(i)) {
				if (i === mesObjetivo) {
					x += (fecha.getDate() - 1) * PX_POR_DIA;
				} else {
					x += getDiasMes(i, anioActual) * PX_POR_DIA;
				}
			}
		}
		return x;
	}

	const posicionHoy = $derived(calcularPosicionX(Date.now()));

	onMount(() => {
		if (contenedor) {
			contenedor.scrollLeft = posicionHoy - contenedor.clientWidth / 2;
		}
	});

	const eventosProcesados = $derived(
		lista_filtrada
			.map((item) => {
				const fechaCreacion = new Date(item.fecha_creacion).getTime();
				let fechaFin = Date.now();

				switch (item.fase) {
					case 1:
						fechaFin = Date.now();
						break;
					case 2:
						fechaFin = item.fecha_analisis ? new Date(item.fecha_analisis).getTime() : Date.now();
						break;
					case 3:
						fechaFin = item.fecha_negociacion
							? new Date(item.fecha_negociacion).getTime()
							: Date.now();
						break;
					case 4:
						fechaFin = item.fecha_pedido ? new Date(item.fecha_pedido).getTime() : Date.now();
						break;
					default:
						fechaFin = item.fecha_cierre
							? new Date(item.fecha_cierre).getTime()
							: new Date(item.fecha_creacion).getTime() + 24 * 60 * 60 * 1000;
						break;
				}

				const inicio = Math.max(fechaCreacion, inicioAnio);
				const fin = Math.min(fechaFin, finAnio);

				const left = calcularPosicionX(inicio);
				const width = calcularPosicionX(fin) - left;

				return {
					...item,
					left,
					width: Math.max(0, width)
				};
			})
			.filter((evento) => evento.width > 0)
	);
</script>

<Vista>
	{#snippet acciones()}
		<!-- <div class="calendar-navigation">
			<button
				onclick={() => (calendarStore.weekOffset -= 1)}
				class="butter nav-btn"
				title="Semana anterior"
			>
				←
			</button>
			<button onclick={() => (calendarStore.weekOffset = 0)} class="butter current-week">
				{weekRangeText}
			</button>
			<button
				onclick={() => (calendarStore.weekOffset += 1)}
				class="butter nav-btn"
				title="Semana siguiente"
			>
				→
			</button>
		</div> -->
		<select
			value={$appState.calendarView}
			onchange={(e) => appState.setCalendarView(e.currentTarget.value)}
		>
			<option value="gant">Gant Anual</option>
			<option value="semanal">Semanal</option>
		</select>
		<PanelFiltros>
			{#snippet header()}
				<button onclick={() => appState.toggleModalOp()} class="butter">+Oportunidad</button>
				<button onclick={() => appState.toggleModalActivity()} class="butter">+Actividad</button>
				{#if $profile?.isAdmin}
					<button
						onclick={() => appState.toggleDnd()}
						class="butter toggle"
						class:active={$appState.dnd}
					>
						✏️ Editar
					</button>
				{/if}
				<button onclick={() => appState.toggleMinimizedCalendarCards()} class="butter toggle">
					{$appState.calendarCards ? '📏 Min' : '📐 Max'}
				</button>
			{/snippet}
			{#snippet controles()}
				<ModList {columnasDinamicas} route={currentRoute} />
			{/snippet}
		</PanelFiltros>
	{/snippet}
	{#snippet contenido()}
		<div class="calendario-contenedor panel" bind:this={contenedor}>
			<div class="cabecera-meses">
				{#each columnasMeses as mes (mes.indice)}
					<button
						class="columna-mes"
						style="width: {mes.ancho}px;"
						onclick={() => ocultarMes(mes.indice)}
						aria-label="Ocultar mes de {mes.nombre}"
					>
						{mes.nombre}
					</button>
				{/each}
			</div>
			<div class="contenedor-tarjetas">
				<!-- Grid de fondo para las líneas de los meses -->
				<div class="grid-fondo">
					{#each columnasMeses as mes (mes.indice)}
						<div class="grid-linea" style="width: {mes.ancho}px;"></div>
					{/each}
				</div>

				<!-- Línea indicadora de fecha actual -->
				<div class="linea-fecha-actual" style="left: {posicionHoy}px;"></div>

				{#each eventosProcesados as evento}
					<div class="fila-evento">
						<TarjetaCalendarioAnual {evento} />
					</div>
				{/each}
			</div>
		</div>
	{/snippet}
</Vista>

<style>
	.calendario-contenedor {
		display: flex;
		flex-direction: column;
		width: 100%;
		overflow: auto;
		scroll-behavior: smooth;
	}

	.cabecera-meses {
		display: flex;
		position: sticky;
		top: 0;
		z-index: 10;
	}

	.columna-mes {
		padding: 4px var(--a);
		border-right: 1px solid var(--color-secondary, #eee);
		flex-shrink: 0;
		border-top: none;
		border-bottom: none;
		border-left: none;
		cursor: pointer;
		text-align: left;
		background-color: var(--color-secondary);
	}

	.contenedor-tarjetas {
		display: flex;
		flex-direction: column;
		position: relative;
		padding-top: var(--b);
	}

	.grid-fondo {
		position: absolute;
		top: 0;
		left: 0;
		height: 100%;
		display: flex;
		pointer-events: none;
		z-index: 0;
	}

	.grid-linea {
		flex-shrink: 0;
		border-right: 1px dashed var(--color-muted, rgba(0, 0, 0, 0.1));
		height: 100%;
	}

	.linea-fecha-actual {
		position: absolute;
		top: 0;
		bottom: 0;
		width: 1px;
		background-color: var(--color-text, #ff0000);
		z-index: 2;
		pointer-events: none;
	}

	.fila-evento {
		position: relative;
		height: var(--d);
		min-width: max-content;
		z-index: 1;
	}
	.calendar-navigation {
		display: flex;
		gap: var(--a);
	}
	.calendar-navigation .current-week {
		min-width: var(--g);
		width: 100%;
	}
</style>
