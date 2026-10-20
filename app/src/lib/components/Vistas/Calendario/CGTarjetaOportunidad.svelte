<script lang="ts">
	import { goto } from '$app/navigation';
	import { fasesOportunidad } from '$lib';

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

	let fase = $derived(fasesOportunidad[evento.fase]);
</script>

<div
	class="tarjeta-wrapper butter"
	class:expanded={isExpanded}
	style="
        left: {evento.left}px; 
        width: {evento.width}px; 
        {fase.estilo}
    "
>
	{#if isExpanded}
		<button
			class="jelly"
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
		justify-self: flex-end;
		height: auto;
		min-height: fit-content;
		min-width: max-content;
		padding: 8px;
		flex-direction: column;
		align-items: flex-start;
		z-index: 999;

	}

	.tarjeta-wrapper.expanded .titulo {
		white-space: normal;
		overflow: visible;
		margin-top: 8px;
	}

	.titulo {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		flex-grow: 1;
		display: flex;
	}
</style>
