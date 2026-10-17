<script lang="ts">
	import { page } from '$app/state';
	import { filterData, sortData } from '$lib/utils/ModList';
	import CGTarjetaOportunidad from './CGTarjetaOportunidad.svelte';
	import { calendarStore } from '$lib/stores/calendarStore.svelte';
	import { tick, untrack } from 'svelte';

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
	const DIA_MS = 24 * 60 * 60 * 1000;
	const ZOOM_MIN = 1;

	const anioReal = new Date().getFullYear();

	let oportunidades = $derived(page.data.oportunidades);
	let currentRoute = $derived(page.url.pathname);

	let lista = $derived(filterData(sortData(oportunidades, currentRoute), currentRoute));

	let expandedEventId = $state<string | null>(null);
	let mesesOcultos = $state<number[]>([]);
	let contenedor = $state<HTMLElement>();
	let contenedorWidth = $state(0);
	const anioVista = $derived(anioReal + calendarStore.yearOffset);

	const inicioAnio = $derived(new Date(anioVista, 0, 1).getTime());
	const finAnio = $derived(new Date(anioVista, 11, 31, 23, 59, 59, 999).getTime());
	const getDiasMes = (mes: number) => new Date(anioVista, mes + 1, 0).getDate();

	const totalDiasVisibles = $derived(
		MESES.reduce((total, _, i) => (mesesOcultos.includes(i) ? total : total + getDiasMes(i)), 0)
	);

	const pxPorDia = $derived(
		contenedorWidth > 0 && totalDiasVisibles > 0
			? (contenedorWidth / totalDiasVisibles) * calendarStore.zoom
			: 8
	);

	const anchoTotal = $derived(totalDiasVisibles * pxPorDia);

	const columnasMeses = $derived(
		MESES.map((nombre, indice) => ({
			nombre,
			indice,
			ancho: getDiasMes(indice) * pxPorDia
		})).filter((mes) => !mesesOcultos.includes(mes.indice))
	);

	function ocultarMes(indice: number) {
		if (!mesesOcultos.includes(indice)) mesesOcultos = [...mesesOcultos, indice];
	}

	function calcularPosicionX(timestamp: number) {
		const fecha = new Date(Math.max(inicioAnio, Math.min(timestamp, finAnio)));
		const mes = fecha.getMonth();
		let x = 0;

		for (let i = 0; i < mes; i++) {
			if (!mesesOcultos.includes(i)) x += getDiasMes(i) * pxPorDia;
		}
		if (!mesesOcultos.includes(mes)) x += (fecha.getDate() - 1) * pxPorDia;

		return x;
	}

	const posicionHoy = $derived(anioVista === anioReal ? calcularPosicionX(Date.now()) : null);

	const FASES_ABIERTAS = [1, 2, 3, 4];

	function obtenerFechaFin(item: any): number {
		const creacion = new Date(item.fecha_creacion).getTime();

		if (!FASES_ABIERTAS.includes(Number(item.fase))) {
			return item.fecha_cierre ? new Date(item.fecha_cierre).getTime() : creacion + DIA_MS;
		}

		return anioVista > anioReal ? finAnio : Date.now();
	}

	const eventosProcesados = $derived(
		lista
			.map((item) => {
				const inicio = Math.max(new Date(item.fecha_creacion).getTime(), inicioAnio);
				const fin = Math.min(obtenerFechaFin(item), finAnio);
				const left = calcularPosicionX(inicio);
				const width = Math.max(0, calcularPosicionX(fin) - left);
				return { ...item, left, width };
			})
			.filter((evento) => evento.width > 0)
	);
	let zoomPrevio = calendarStore.zoom;

	$effect.pre(() => {
		const zoom = calendarStore.zoom;
		const el = contenedor;
		if (!el || zoom === zoomPrevio) return;

		const hoy = posicionHoy; // valor antiguo: el efecto es "pre"
		const anchoAntes = el.scrollWidth;
		const scrollAntes = el.scrollLeft;
		zoomPrevio = zoom;

		// Anclaje: hoy si estamos en el año actual, si no el centro del viewport
		const fraccion =
			hoy !== null && anchoAntes > 0
				? hoy / anchoAntes
				: (scrollAntes + el.clientWidth / 2) / anchoAntes;

		// Posición en pantalla del ancla antes del zoom, para mantenerla fija
		const offsetPantalla = hoy !== null ? hoy - scrollAntes : el.clientWidth / 2;

		tick().then(() => {
			el.scrollTo({
				left: (fraccion * el.scrollWidth - offsetPantalla)-40,
				behavior: 'instant'
			});
		});
	});
	const listo = $derived(contenedorWidth > 0);

	$effect(() => {
		anioVista; // dependencia: al cambiar de año
		if (!listo) return; // espera a que el contenedor tenga ancho real

		untrack(() => {
			expandedEventId = null;
		});

		tick().then(() => {
			const el = contenedor;
			if (!el) return;
			const left = posicionHoy !== null ? Math.max(0, posicionHoy - el.clientWidth / 2) : 0;
			el.scrollTo({ left, behavior: 'instant' });
		});
	});

	function alternarExpandido(id: string) {
		expandedEventId = expandedEventId === id ? null : id;
	}
</script>

<div
	class="calendario-contenedor"
	class:con-zoom={calendarStore.zoom > ZOOM_MIN}
	bind:this={contenedor}
	bind:clientWidth={contenedorWidth}
>
	<div class="lienzo" style="width: {anchoTotal}px;">
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
			<div class="grid-fondo">
				{#each columnasMeses as mes (mes.indice)}
					<div class="grid-linea" style="width: {mes.ancho}px;"></div>
				{/each}
			</div>

			{#if posicionHoy !== null}
				<div class="linea-fecha-actual" style="left: {posicionHoy}px;"></div>
			{/if}

			{#each eventosProcesados as evento (evento.id)}
				{@const expandido = expandedEventId === evento.id}
				<div
					class="fila-evento"
					class:expanded={expandido}
					role="button"
					tabindex="0"
					onclick={() => alternarExpandido(evento.id)}
					onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && alternarExpandido(evento.id)}
				>
					<CGTarjetaOportunidad {evento} isExpanded={expandido} />
				</div>
			{/each}
		</div>
	</div>
</div>

<style>
	.calendario-contenedor {
		width: 100%;
		max-width: 90vw;
		height: 100%;
		margin-inline: auto;
		overflow-x: hidden;
		overflow-y: auto;
	}

	.calendario-contenedor.con-zoom {
		overflow-x: auto;
	}

	.lienzo {
		display: flex;
		flex-direction: column;
		min-height: 100%;
	}

	.cabecera-meses {
		display: flex;
		position: sticky;
		top: 0;
		z-index: 10;
	}

	.columna-mes {
		flex-shrink: 0;
		padding: 4px var(--a);
		border: none;
		border-right: 1px solid var(--color-secondary, #eee);
		background-color: var(--color-secondary);
		text-align: left;
		cursor: pointer;
	}

	.contenedor-tarjetas {
		position: relative;
		display: flex;
		flex: 1;
		flex-direction: column;
		padding-top: var(--b);
	}

	.grid-fondo {
		position: absolute;
		inset: 0 auto 0 0;
		display: flex;
		pointer-events: none;
	}

	.grid-linea {
		flex-shrink: 0;
		height: 100%;
		border-right: 1px dashed var(--color-muted, rgba(0, 0, 0, 0.1));
	}

	.linea-fecha-actual {
		position: absolute;
		top: 0;
		bottom: 0;
		width: 1px;
		background-color: var(--color-text, #ff0000);
		pointer-events: none;
		z-index: 2;
	}

	.fila-evento {
		position: relative;
		flex-shrink: 0;
		width: 100%;
		height: var(--d);
		cursor: pointer;
		z-index: 1;
	}

	.fila-evento.expanded {
		height: auto;
		min-height: var(--alto-expandido, 120px);
		cursor: default;
	}
</style>
