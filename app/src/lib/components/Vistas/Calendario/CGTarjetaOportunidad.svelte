<script lang="ts">
	import { goto } from '$app/navigation';
	import { getStyleForPhase } from '$lib/utils/util';

	let { evento, isExpanded = false } = $props<{
		evento: {
			id: string | number;
			left: number;
			width: number;
			clientes: {
				nombre_comercial?: string;
				razon_social?: string;
			};
			fase: number;
			[key: string]: any;
		};
		isExpanded?: boolean;
	}>();

	let style = $derived(getStyleForPhase(evento.fase));
</script>

<div
	class="tarjeta-wrapper"
	class:expanded={isExpanded}
	style="
        left: {evento.left}px; 
        width: {evento.width}px; 
        {style}
    "
>
	{#if isExpanded}
		<button
			class="nav-button"
			onclick={(e) => {
				e.stopPropagation();
				goto(`/oportunidades/${evento.id}`);
			}}
		>
			Ver
		</button>
	{/if}
	<span class="titulo">
		{evento.clientes.nombre_comercial || evento.clientes.razon_social}
	</span>
</div>

<style>
	.tarjeta-wrapper {
		position: absolute;
		top: 0;
		height: 32px;
		background-color: #b3b3b3;
		border-radius: 8px;
		box-shadow: -2px 0px 5px rgba(0, 0, 0, 0.1);
		transition:
			box-shadow 0.2s ease,
			z-index 0s;
		user-select: none;
		-webkit-user-select: none;
		overflow: hidden;
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 0 8px;
		box-sizing: border-box;
	}

	.tarjeta-wrapper.expanded {
		height: auto;
		min-height: fit-content;
		min-width: max-content; /* Asegura espacio para el botón si el evento es muy corto */
		padding: 8px;
		flex-direction: column;
		align-items: flex-start;
		box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
		z-index: 999;
	}

	.tarjeta-wrapper.expanded .titulo {
		white-space: normal;
		overflow: visible;
		margin-top: 8px;
	}

	.nav-button {
		background: rgba(0, 0, 0, 0.1);
		color: inherit;
		border: none;
		padding: 4px 8px;
		border-radius: 4px;
		font: inherit;
		font-size: 0.8em;
		cursor: pointer;
		z-index: 2;
	}

	.titulo {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		flex-grow: 1;
	}
</style>
