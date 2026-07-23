<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import type { Snippet } from 'svelte';

	let {
		id,
		action = '/clientes?/updateClient',
		isEditing = false,
		children
	}: {
		id: string;
		action?: string;
		isEditing?: boolean;
		children?: Snippet;
	} = $props();

	let isSubmitting = $state(false);

	function handleSubmit() {
		isSubmitting = true;
		return async ({ result }: any) => {
			if (result.type === 'success') {
				await invalidateAll();
			}
			isSubmitting = false;
		};
	}
</script>

{#if isEditing}
	<form method="POST" {action} use:enhance={handleSubmit}>
		<input type="hidden" name="id" value={id} />

		<section class="container editable-fields-grid">
			{#if isEditing}
				{#if children}
					{@render children()}
				{/if}
				<button
					type="submit"
					class="btn-save-small butter"
					disabled={isSubmitting}
					style:opacity={isSubmitting ? 0.5 : 1}
					style:cursor={isSubmitting ? 'not-allowed' : 'pointer'}
				>
					Guardar
				</button>
			{/if}
		</section>
	</form>
{/if}

<style>
	form {
		grid-column: span 2;
		width: 100%;
	}
	.container {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
	}
	input {
		flex-grow: 1;
	}
</style>
