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

	// Evita que el primer carácter sea un espacio en tiempo real
	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement | HTMLTextAreaElement;
		if (type === 'text' || type === 'textarea' || type === 'email') {
			const cleaned = target.value.replace(/^\s+/, '');
			if (target.value !== cleaned) {
				target.value = cleaned;
				value = cleaned; // Sincroniza el bind:value
			}
		}
	}

	// Limpia espacios sobrantes al final cuando el input pierde el foco
	function handleBlur() {
		if (typeof value === 'string') {
			value = value.trim();
		}
	}
</script>

<div class="field-block">
	<div class="field-header">
		<label for={name} class="label">
			<h3>
				{label}{required ? '*' : ''}
			</h3>
		</label>
	</div>
    
	{#if type === 'textarea'}
		<textarea
			id={name}
			{name}
			bind:value
			{rows}
			{placeholder}
			{required}
			{disabled}
            title={hint}
			oninput={handleInput}
			onblur={handleBlur}
		></textarea>
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
		<input
			id={name}
			{type}
			{name}
			bind:value
			{placeholder}
			{required}
			{disabled}
			oninput={handleInput}
			onblur={handleBlur}
			pattern={type === 'text' && required ? '.*\\S+.*' : undefined}
			title={type === 'text' && required
				? 'Este campo no puede estar vacío ni contener solo espacios'
				: undefined}
		/>
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
		margin-left: var(--b);
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
