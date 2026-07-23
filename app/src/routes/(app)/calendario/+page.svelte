<script lang="ts">
	import { page } from '$app/state';
	import { procesarDatosReactivos } from '$lib/utils/filtro';
	import CalendarioAnual from '$lib/components/Calendario/CalendarioAnual.svelte';
	import Lista from '$lib/components/App/Listas/Lista.svelte';
	import PanelFiltros from '$lib/components/App/PanelFiltros.svelte';
	import FiltroAgente from '$lib/components/App/FiltroAgente.svelte';
	import Filtro from '$lib/components/App/Filtro.svelte';
	import { categoriasOportunidad } from '$lib';
	import { appState } from '$lib/stores/appState.svelte';
	import Select from '$lib/components/App/Select.svelte';
	import { calendarStore } from '$lib/stores/calendarStore.svelte';
	import { formatWeekRange, getWeekDates } from '$lib/utils/agenda';
	import { profile } from '$lib/stores/profileStore.svelte';
	import CalendarioSemanal from '$lib/components/Calendario/CalendarioSemanal.svelte';

	let selected = $state('gant');
	const weekDates = $derived(getWeekDates(calendarStore.weekOffset));
	const weekRangeText = $derived(formatWeekRange(weekDates));
</script>

<Lista>
	{#snippet acciones()}
		<Select
			bind:selected
			options={[
				{ label: 'Gant oportunidades', value: 'gant' },
				{ label: 'Semanal', value: 'semanal' }
			]}
		/>
		{#if selected == 'semanal'}
			<div class="calendar-navigation">
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
			</div>
		{/if}
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
				<FiltroAgente />
				<Filtro categorias={categoriasOportunidad} />
			{/snippet}
		</PanelFiltros>
	{/snippet}
	{#snippet contenido()}
		{#if selected == 'gant'}
			<CalendarioAnual />
		{:else}
			<CalendarioSemanal />
		{/if}
	{/snippet}
</Lista>
