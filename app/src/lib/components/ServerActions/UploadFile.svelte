<script lang="ts">
	let {
		label = null,
		name = 'file',
		required = false,
		disabled = false,
		hint = ''
	}: {
		label: string | null;
		name: string;
		required?: boolean;
		disabled?: boolean;
		hint?: string;
	} = $props();
</script>

<div class="upload-container">
	{#if label}
		<h3>{label}</h3>
	{/if}
	{#if hint}
		<p class="hint">{hint}</p>
	{/if}
	
	<input id={name} type="file" {name} class="file-input" {required} {disabled} />
</div>

<style>
	.upload-container {
		width: 100%;

	}

	.hint {
		font-size: 14px;
		opacity: 0.7;
		margin: 0;
	}

	.file-input {
		padding: 8px;
		border-radius: 4px;
		border: 1px solid rgba(255, 255, 255, 0.3);
		background: rgba(255, 255, 255, 0.1);
		color: inherit;
		cursor: pointer;
		font-size: 14px;
	}

	input:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
</style>
