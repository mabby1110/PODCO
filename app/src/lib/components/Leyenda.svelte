<script>
	// Definimos los pasos por defecto usando las variables y colores que proporcionaste.
	// Al usar $props(), permitimos que este array sea sobreescrito si lo necesitas en el futuro.
	let {
		steps = [
			{ label: 'Prospecto (1)', color: 'var(--color-secondary)' },
			{ label: 'Oportunidad (2)', color: '#5ca8ff99' },
			{ label: 'Negociación (3)', color: '#ffd70099' },
			{ label: 'Ganada (4)', color: '#34d76a99' },
			// { label: 'Enviar (5)', color: '#6575ff99' },
			// { label: 'Finalizar (6)', color: '#000000ee' }
		]
	} = $props();
	let show = $state(false);
</script>

<div class="funnel-legend">
	{#each steps as step, index}
		<div class="legend-item">
			<span class="color-box" style="background-color: {step.color};"></span>
			<span class="label">{step.label}</span>
		</div>

		{#if index < steps.length - 1}
			<span class="separator">&gt;</span>
		{/if}
	{/each}
</div>

<style>
	.funnel-legend {
		display: flex;
		flex-wrap: wrap;
		width: 100%;
		align-items: center;
		gap: var(--a);
		color: #333;
		max-width: 80vw;
		font-size: small;
	}

	.legend-item {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		white-space: nowrap;
	}

	.color-box {
		display: inline-block;
		width: 10px;
		height: 10px;
		border-radius: 2px;
		border: 1px solid rgba(0, 0, 0, 0.1);
	}

	.separator {
		user-select: none;
	}
</style>
