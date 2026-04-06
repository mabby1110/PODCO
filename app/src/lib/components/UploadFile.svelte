<script lang="ts">
	let {
		label = null,
		name = 'file',
		required = false,
		disabled = false,
		hint = '',
		multiple = true
	}: {
		label: string | null;
		name: string;
		required?: boolean;
		disabled?: boolean;
		hint?: string;
		multiple?: boolean;
	} = $props();

	let files = $state<File[]>([]);
	let inputEl: HTMLInputElement;

	function handleChange(e: Event) {
		const input = e.target as HTMLInputElement;
		if (!input.files) return;

		const selected = Array.from(input.files);

		if (multiple) {
			files = [...files, ...selected];
		} else {
			files = [selected[0]];
		}

		updateInputFiles();
	}

	function removeFile(index: number) {
		files.splice(index, 1);
		files = [...files];
		updateInputFiles();
	}

	function updateInputFiles() {
		const dt = new DataTransfer();
		files.forEach((f) => dt.items.add(f));
		inputEl.files = dt.files;
	}
</script>

<div class="upload-container">
	{#if label}
		<h3>{label}</h3>
	{/if}

	{#if hint}
		<p class="hint">{hint}</p>
	{/if}
	<input
		bind:this={inputEl}
		id={name}
		type="file"
		{name}
		class="file-input"
		{multiple}
		onchange={handleChange}
		{required}
		{disabled}
	/>
	{#if files.length > 0}
		<div class="files">
			{#each files as file, i}
				<div class="file">
					<button class="close-btn" type="button" onclick={() => removeFile(i)}>x</button>
					<p>
						{file.name}
					</p>
				</div>
			{/each}
		</div>
	{/if}
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
		width: 100%;
	}
	.files {
		display: flex;
		flex-direction: column;
		gap: var(--a);
	}
	.file {
		display: flex;
		align-items: center;
		gap: var(--a);
	}
	input:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
</style>
