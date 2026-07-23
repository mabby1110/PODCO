<script lang="ts">
	import { getStyleForPhase } from '$lib/utils/util';

	let { evento } = $props<{
		evento: {
			left: number;
			width: number;
			[key: string]: any;
		};
	}>();
	let style = $derived(getStyleForPhase(evento.fase));
</script>

<div class="tarjeta-wrapper" style="left: {evento.left}px; width: {evento.width}px; {style}">
	
</div>

<style>
	.tarjeta-wrapper {
		position: absolute;
		top: 0;
		height: 32px;
		background-color: #b3b3b3; /* Referencia de color base Frame 2.png */
		border-radius: 8px;
		box-shadow: -2px 0px 5px rgba(0, 0, 0, 0.1); /*[cite: 1] */
		transition:
			box-shadow 0.2s ease,
			z-index 0s; /*[cite: 1] */
		user-select: none; /*[cite: 1] */
		-webkit-user-select: none; /*[cite: 1] */
	}

	.tarjeta-wrapper:hover {
		z-index: 999 !important; /*[cite: 1] */
		box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
	}
</style>
