<script lang="ts">
	import Select from '../Select.svelte';
	import { agrupacionesStore } from '$lib/stores/AgrupacionesStore.svelte';
	import { page } from '$app/state';

	let {
		agrupacionesSeleccionadas = $bindable(),
		agrupaciones,
		categorias,
		cookies = page.url.pathname
	} = $props<{
		agrupaciones: any;
		agrupacionesSeleccionadas: string[];
		categorias: any;
		cookies?: string;
	}>();
	console.log(agrupaciones);
	function seleccionarAgrupacion(e: string): void {
		const index = agrupacionesSeleccionadas.indexOf(e);
		if (index !== -1) {
			agrupacionesSeleccionadas.splice(index, 1);
		} else {
			agrupacionesSeleccionadas.push(e);
		}
	}

	function seleccionarTodos(): void {
		agrupacionesSeleccionadas = agrupaciones.map((a: any) => a.grupo);
	}
</script>

<div class="contenedor-agrupaciones">
	<div class="panel">
		<div class="acciones">
			<Select
				options={categorias}
				defaultOption="Agrupar todos"
				bind:selected={agrupacionesStore.filtersByRoute[cookies]}
			/>

			<button class="butter" onclick={seleccionarTodos}>
				Reset ({agrupacionesSeleccionadas.length})
			</button>
		</div>

		<div class="agrupaciones">
			{#each agrupaciones as agrupacion}
				<button
					class="butter"
					class:seleccionado={agrupacionesSeleccionadas.includes(agrupacion.grupo)}
					onclick={() => seleccionarAgrupacion(agrupacion.grupo)}
				>
					{agrupacion.grupo}
				</button>
			{/each}
		</div>
	</div>
</div>

<style>
	.contenedor-agrupaciones {
		width: 100%;
	}
	.panel {
		display: flex;
		flex-wrap: wrap;
		gap: var(--a);
		height: fit-content;
		align-items: baseline;
		background-color: var(--color-contrast);
	}
	.acciones {
		display: flex;
		flex-direction: column;
		gap: var(--a);
	}
	.agrupaciones {
		flex-grow: 1;
		display: flex;
		gap: var(--a);
		flex-direction: column;
		max-height: 20vh;
		overflow: auto;
	}
	.butter {
		height: fit-content;
	}
	.agrupaciones button {
		border: none;
		text-align: start;
		transition:
			background-color 0.2s ease,
			color 0.2s ease;
	}
	.agrupaciones button:hover {
		opacity: 40%;
	}
	.agrupaciones button.seleccionado:hover {
		opacity: 40%;
	}
	.agrupaciones button.seleccionado {
		background-color: var(--color-highlight);
	}
</style>
