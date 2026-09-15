<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { page } from '$app/state';
	import { StorePedidoOportunidad } from '$lib/stores/pedidos/StorePedidoOportunidad.svelte';
	import { profile } from '$lib/stores/profileStore.svelte';

	type Item = {
		file: File;
		titulo: string;
	};

	let {
		tipo = 'files',
		oportunidad,
		action = '/documentos?/subirAdjunto',
		required = false,
		disabled = false,
		submitLabel = 'Guardar'
	}: {
		tipo: string;
		oportunidad: { id: string; cliente: string };
		action?: string;
		required?: boolean;
		disabled?: boolean;
		submitLabel?: string;
	} = $props();

	let item = $state<Item | null>(null);
	let inputEl: HTMLInputElement;
	let formEl: HTMLFormElement;
	let isDragging = $state(false);
	let isSubmitting = $state(false);
	let pedidosACrear = $derived(
		page.data.pedidos.filter((p) => StorePedidoOportunidad.carrito.some((item) => item.id === p.id))
	);
	function handleChange(e: Event) {
		const input = e.target as HTMLInputElement;

		if (!input.files || input.files.length === 0) return;

		// Tomar solo el primer archivo
		const file = input.files[0];

		item = {
			file,
			titulo: file.name.split('.')[0]
		};

		input.value = '';
	}

	// Ya no necesitas un índice, simplemente limpias el archivo actual
	function removeItem() {
		item = null;
	}

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();

		if (isSubmitting) return;

		isSubmitting = true;

		try {
			const formData = new FormData(formEl);
			formData.append('pedidosACrear', JSON.stringify(pedidosACrear));

			// Si hay un archivo seleccionado, lo agregas al formData
			if (item) {
				const file = new File([item.file], item.titulo, {
					type: item.file.type
				});

				formData.append(tipo, file);
			}

			const response = await fetch(action, {
				method: 'POST',
				body: formData
			});

			if (!response.ok) {
				const result = await response.text();
				console.error(result);
				return;
			}

			// Limpias el estado después de enviar
			item = null;

			if (inputEl) {
				inputEl.value = '';
			}

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
	<input type="hidden" name="id_oportunidad" value={oportunidad.id} />
	<input type="hidden" name="nombre_agente" value={$profile?.nombre} />
	<input type="hidden" name="nombre_cliente" value={oportunidad.cliente} />

	<div class="upload-container">
		<div class="drop-zone" class:dragging={isDragging}>
			<span class="drop-text">subir cotizacion</span>
			<input
				bind:this={inputEl}
				type="file"
				class="file-input"
				required={required && item === null}
				onchange={handleChange}
				ondragover={() => {
					if (!disabled) isDragging = true;
				}}
				ondragleave={() => {
					isDragging = false;
				}}
				ondrop={() => {
					isDragging = false;
				}}
			/>
		</div>

		{#if item}
			<div class="files">
				<div class="item">
					<!-- Ya no pasamos el índice (i), solo llamamos a removeItem -->
					<button type="button" class="close-btn" onclick={removeItem}> × </button>

					<div class="info">
						<!-- El binding se hace directamente sobre item.titulo -->
						<input type="text" bind:value={item.titulo} />
					</div>
				</div>

				<button type="submit" class="btn-save-small butter" disabled={isSubmitting}>
					{#if isSubmitting}
						Guardando...
					{:else}
						{submitLabel}
					{/if}
				</button>
			</div>
		{/if}
	</div>
</form>

<style>
	form {
		width: 100%;
	}

	.upload-container {
		display: flex;
		flex-direction: column;
		gap: var(--a);
		width: 100%;
	}

	.file-input {
		width: 100%;
		max-width: 800px;
		min-height: var(--f);
		padding: var(--c);
		border: 1px dashed #d4d4d8;
		border-radius: 16px;
		background-color: #fafafa;
		cursor: pointer;
		transition:
			border-color 0.2s ease,
			background-color 0.2s ease;
		outline: none;
	}

	.file-input:hover:not(:disabled) {
		border-color: var(--color-secondary);
		background-color: #f4f4f5;
	}

	.drop-zone {
		position: relative;
		display: flex;
		justify-content: center;
		align-items: center;
		width: 100%;
		max-width: 800px;
		min-height: var(--f);
		padding: var(--c);
		border: 1px dashed var(--color-muted);
		border-radius: 16px;
		background-color: #fafafa;
		transition:
			border-color 0.2s ease,
			background-color 0.2s ease;
		overflow: hidden;
	}

	.drop-zone:hover {
		border-color: var(--color-secondary);
		background-color: #f4f4f5;
	}

	.drop-zone.dragging {
		background-color: var(--color-highlight);
		border-color: var(--color-highlight);
	}

	/* Mantiene el borde negro al navegar con teclado */
	.drop-zone:has(.file-input:focus-visible) {
		border-color: #18181b;
		border-style: solid;
	}

	.drop-text {
		color: var(--color-secondary);
		pointer-events: none; /* Asegura que el clic lo reciba el input debajo */
		z-index: 1;
	}

	.file-input {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		opacity: 0; /* Oculta el diseño por defecto del navegador */
		cursor: pointer;
		z-index: 2;
		outline: none;
	}

	.file-input:focus-visible {
		border-color: var(--color-text);
		border-style: solid;
	}

	.file-input::file-selector-button {
		display: none;
	}

	.files {
		display: flex;
		flex-direction: column;
		gap: var(--a);
	}

	.item {
		display: flex;
		gap: var(--a);
		align-items: baseline;
		padding: var(--a);
	}

	.info {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: var(--a);
	}
	.close-btn {
		border: none;
		cursor: pointer;
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
	}

	.close-btn:hover {
		background-color: var(--color-error);
	}
</style>
