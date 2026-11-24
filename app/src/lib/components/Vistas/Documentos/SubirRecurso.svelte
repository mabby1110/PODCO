<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { profile } from '$lib/stores/profileStore.svelte';

	type Item = {
		file: File;
		titulo: string;
		extension: string;
	};

	let {
		tipo = 'files',
		categoria,
		action = '/recursos?/subirRecurso',
		required = false,
		disabled = false,
		submitLabel = 'Guardar'
	}: {
		tipo?: string;
		categoria?: string;
		action?: string;
		required?: boolean;
		disabled?: boolean;
		submitLabel?: string;
	} = $props();

	let items = $state<Item[]>([]);
	let inputEl: HTMLInputElement;
	let formEl: HTMLFormElement;
	let isDragging = $state(false);
	let isSubmitting = $state(false);

	function handleChange(e: Event) {
		const input = e.target as HTMLInputElement;
		if (!input.files) return;

		const newItems = Array.from(input.files).map((file) => {
			const dot = file.name.lastIndexOf('.');
			return {
				file,
				titulo: dot > 0 ? file.name.slice(0, dot) : file.name,
				extension: dot > 0 ? file.name.slice(dot) : ''
			};
		});

		items = [...items, ...newItems];
		input.value = '';
	}

	function removeItem(index: number) {
		items = items.filter((_, i) => i !== index);
	}

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		if (isSubmitting || items.length === 0) return;

		isSubmitting = true;

		try {
			const formData = new FormData(formEl);

			items.forEach((item) => {
				const file = new File([item.file], `${item.titulo.trim()}${item.extension}`, {
					type: item.file.type
				});
				formData.append(tipo, file);
			});

			const response = await fetch(action, { method: 'POST', body: formData });

			if (!response.ok) {
				console.error(await response.text());
				return;
			}

			items = [];
			if (inputEl) inputEl.value = '';

			await invalidateAll();
		} catch (error) {
			console.error(error);
		} finally {
			isSubmitting = false;
		}
	}
</script>

<form
	bind:this={formEl}
	method="POST"
	enctype="multipart/form-data"
	{action}
	onsubmit={handleSubmit}
>
	<input type="hidden" name="tipo" value={tipo} />
	{#if categoria}
		<input type="hidden" name="categoria" value={categoria} />
	{/if}
	<input type="hidden" name="nombre_agente" value={$profile?.nombre} />

	<div class="upload-container">
		<input
			bind:this={inputEl}
			type="file"
			class="file-input"
			class:dragging={isDragging}
			multiple
			{disabled}
			required={required && items.length === 0}
			onchange={handleChange}
			ondragover={() => {
				if (!disabled) isDragging = true;
			}}
			ondragleave={() => (isDragging = false)}
			ondrop={() => (isDragging = false)}
		/>

		{#if items.length > 0}
			<div class="files">
				{#each items as item, i}
					<div class="item">
						<button type="button" class="close-btn" onclick={() => removeItem(i)}> × </button>

						<div class="info">
							<input type="text" bind:value={item.titulo} required />
						</div>
					</div>
				{/each}
				<button type="submit" class="btn-save-small butter" disabled={isSubmitting}>
					{isSubmitting ? 'Guardando...' : submitLabel}
				</button>
			</div>
		{/if}
	</div>
</form>