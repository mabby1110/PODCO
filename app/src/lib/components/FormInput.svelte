<script lang="ts">
	let {
		label,
		name,
		value = $bindable(),
		type = 'text',
		rows = 3,
		placeholder = '',
		hint = '',
		required = false,
		disabled = false
	}: {
		label: string;
		name: string;
		value: string | File | null;
		type?: 'text' | 'textarea' | 'file' | 'email' | 'number' | 'date';
		rows?: number;
		placeholder?: string;
		hint?: string;
		required?: boolean;
		disabled?: boolean;
	} = $props();

	function onFileChange(e: Event) {
		const input = e.target as HTMLInputElement;
		value = input.files?.[0] ?? null;
	}
</script>

<div class="field-block">
	<div class="field-header">
		<label for={name} class="label">
			<span>
				{label}{required ? '*' : ''}
			</span>
		</label>
	</div>

	{#if hint}
		<p class="hint">{hint}</p>
	{/if}

	{#if type === 'textarea'}
		<textarea id={name} {name} bind:value {rows} {placeholder} {required} {disabled}></textarea>
	{:else if type === 'file'}
		<input
			id={name}
			type="file"
			{name}
			class="file-input"
			onchange={onFileChange}
			{required}
			{disabled}
		/>
	{:else}
		<input id={name} {type} {name} bind:value {placeholder} {required} {disabled} />
	{/if}
</div>

<style>
	.field-block {
		display: flex;
		flex-direction: column;
		gap: 8px;
		width: 100%;
	}

	.field-header {
		display: flex;
		align-items: center;
	}

	.hint {
		font-size: 14px;
		opacity: 0.7;
		margin: 0;
	}

	textarea,
	input[type='text'],
	input[type='email'],
	input[type='number'],
	input[type='date'] {
		width: 100%;
		padding: 8px;
		border-radius: var(--a);
		border: 1px solid var(--color-muted);
		color: inherit;
		font-family: inherit;
		font-size: 14px;
	}

	input:disabled,
	textarea:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	input:focus,
	textarea:focus {
		outline: none;
		border-color: var(--color-contrast);
	}
</style>
