<script lang="ts">
	import { page } from '$app/state';
	import Controles from '$lib/components/Acciones/Controles.svelte';
	import ModList from '$lib/components/Acciones/ModList.svelte';
	import Vista from '$lib/components/Tarjetas/Vista.svelte';
	import CalendarioAnual from '$lib/components/Vistas/Calendario/CalendarioAnual.svelte';
	import CalendarioMensual from '$lib/components/Vistas/Calendario/CalendarioMensual.svelte';
	import CalendarioSemanal from '$lib/components/Vistas/Calendario/CalendarioSemanal.svelte';
	import { appState } from '$lib/stores/appState.svelte';
	import { calendarStore } from '$lib/stores/calendarStore.svelte';
	import { formatWeekRange, getMonth, getWeekDates } from '$lib/utils/agenda';
	import { extraerColumnas } from '$lib/utils/ModList';
	import { tick } from 'svelte';

	let { oportunidades, actividades } = $derived(page.data);
	let currentRoute = $derived(page.url.pathname);

	let columnasDinamicas = $derived(
		Array.from(
			new Map(
				[...extraerColumnas(oportunidades), ...extraerColumnas(actividades)].map((col) => [
					col.key,
					col
				])
			).values()
		)
	);
	const monthDate = $derived.by(() => {
		const now = new Date();
		return new Date(now.getFullYear(), now.getMonth() + calendarStore.monthOffset, 1);
	});
	const weekDates = $derived(getWeekDates(calendarStore.weekOffset));
	const weekRangeText = $derived(formatWeekRange(weekDates));
	const añoReal = new Date().getFullYear();
	let añoVista = $derived(añoReal + calendarStore.yearOffset);
	const ZOOM_MIN = 1;
	const ZOOM_MAX = 10;
	let zoomLevel = $state(ZOOM_MIN);
	let contenedor = $state<HTMLElement>();
	async function cambiarZoom(valor: number) {
		const el = contenedor;
		if (!el) {
			zoomLevel = valor;
			return;
		}
		const centro = (el.scrollLeft + el.clientWidth / 2) / el.scrollWidth;
		zoomLevel = valor;
		calendarStore.zoom = valor;
		await tick();
		el.scrollTo({ left: centro * el.scrollWidth - el.clientWidth / 2, behavior: 'instant' });
	}
</script>

<Vista fullscreen>
	{#snippet acciones()}
		{#if $appState.calendarView == 'gant'}
			<div class="calendar-navigation">
				<button
					onclick={() => (calendarStore.yearOffset -= 1)}
					class="honey nav-btn"
					title="Año anterior"
				>
					←
				</button>
				<button
					onclick={() => (calendarStore.yearOffset = 0)}
					class="honey current-year"
					title="Año actual"
				>
					{añoVista}
				</button>
				<button
					onclick={() => (calendarStore.yearOffset += 1)}
					class="honey nav-btn"
					title="Año siguiente"
				>
					→
				</button>
			</div>
		{:else if $appState.calendarView == 'mensual'}
			<div class="calendar-navigation">
				<button
					onclick={() => (calendarStore.monthOffset -= 1)}
					class="honey nav-btn"
					title="Mes anterior"
				>
					←
				</button>
				<button onclick={() => (calendarStore.monthOffset = 0)} class="honey current-month">
					{getMonth(monthDate)}
				</button>
				<button
					onclick={() => (calendarStore.monthOffset += 1)}
					class="honey nav-btn"
					title="Mes siguiente"
				>
					→
				</button>
			</div>
		{:else}
			<div class="calendar-navigation accion">
				<button
					onclick={() => (calendarStore.weekOffset -= 1)}
					class="honey accion nav-btn"
					title="Semana anterior"
				>
					←
				</button>
				<button
					onclick={() => (calendarStore.weekOffset = 0)}
					class="honey accion nav-btn week-range"
				>
					{weekRangeText}
				</button>
				<button
					onclick={() => (calendarStore.weekOffset += 1)}
					class="honey accion nav-btn"
					title="Semana siguiente"
				>
					→
				</button>
			</div>
		{/if}
		<Controles>
			{#snippet header()}
				<button onclick={() => appState.toggleModalOp()} class="jelly">+Oportunidad</button>
				<button onclick={() => appState.toggleModalActivity()} class="jelly">+Actividad</button>
			{/snippet}
			{#snippet acciones()}
				<select
					value={$appState.calendarView}
					onchange={(e) => appState.setCalendarView(e.currentTarget.value)}
				>
					<option value="gant">Gant Anual</option>
					<option value="mensual">Mensual</option>
					<option value="semanal">Semanal</option>
				</select>
				{#if $appState.calendarView == 'gant'}
					<input
						type="range"
						bind:value={calendarStore.zoom}
						min={ZOOM_MIN}
						max={ZOOM_MAX}
						step="0.5"
						title="Nivel de Zoom"
						class="zoom-slider"
					/>
				{/if}
				<select
					value={$appState.calendarList}
					onchange={(e) => appState.setCalendarList(e.currentTarget.value)}
				>
					<option value="">Todas</option>
					<option value="actividades">Actividades</option>
					<option value="oportunidades">Oportunidades</option>
				</select>
				<button onclick={() => appState.toggleMinimizedCalendarCards()} class="jelly toggle">
					{$appState.calendarCards ? 'Min' : 'Max'}
				</button>
				<ModList {columnasDinamicas} route={currentRoute} />
			{/snippet}
		</Controles>
	{/snippet}

	{#snippet contenido()}
		{#if $appState.calendarView == 'gant'}
			<CalendarioAnual />
		{:else if $appState.calendarView == 'mensual'}
			<CalendarioMensual />
		{:else}
			<CalendarioSemanal />
		{/if}
	{/snippet}
</Vista>

<style>
	.week-range {
		min-width: var(--g);
	}
	.nav-btn {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.calendar-navigation {
		display: flex;
		flex-grow: 1;
	}
	.zoom-slider {
		width: 100px;
		margin-right: var(--a);
		cursor: ew-resize;
	}
</style>
