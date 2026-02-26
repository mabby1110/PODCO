<script lang="ts">
	let {
		label,
		name = "file",
		required = false,
		disabled = false,
		hint = ''
	}: {
		label: string;
		name: string;
		required?: boolean;
		disabled?: boolean;
		hint?: string;
	} = $props();
</script>

<form
	method="POST"
	action="?/uploadFile"
	enctype="multipart/form-data"
	class="field-block"
>
	<div class="field-header">
		<label for={name} class="label">
			{label}{required ? '*' : ''}
		</label>
	</div>

	{#if hint}
		<p class="hint">{hint}</p>
	{/if}

	<input
		id={name}
		type="file"
		{name}
		class="file-input"
		{required}
		{disabled}
	/>

	<button type="submit" class="submit-btn">
		Subir
	</button>
</form>

<style>
	.field-block {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.label {
		font-size: 20px;
		cursor: pointer;
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

	.submit-btn {
		align-self: flex-start;
		padding: 8px 16px;
		border-radius: 4px;
		border: 1px solid rgba(255, 255, 255, 0.3);
		background: rgba(255, 255, 255, 0.2);
		color: inherit;
		cursor: pointer;
	}

	input:disabled,
	button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
</style>
