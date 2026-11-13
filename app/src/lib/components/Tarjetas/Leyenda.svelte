<script lang="ts">
	import { StoreAplicacion } from '$lib/stores/app/StoreAplicacion.svelte';

	let { steps = [] } = $props();
</script>

{#if StoreAplicacion.value.leyenda}
	<div class="leyenda">
		<div class="funnel-legend panel">
			{#each steps as step, index}
				<div class="legend-item">
					<span class="color-box " style={step.estilo}>{index}</span>
					<span class="label">{step.actual}</span>
				</div>

				{#if index < steps.length - 1}
					<span class="separator">&gt;</span>
				{/if}
			{/each}
		</div>
	</div>
{/if}

<style>
	.funnel-legend {
		height: 100%;
		display: flex;
		flex-wrap: wrap;
		width: fit-content;

		align-items: center;
		gap: var(--a);
		color: #333;
		max-width: 80vw;
		font-size: smaller;
		margin: var(--b);
	}

	.legend-item {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		white-space: nowrap;
	}

	.color-box {
		border-radius: var(--y);
		padding: 0 var(--y);
		font-size: smaller;
	}

	.separator {
		user-select: none;
	}
</style>
