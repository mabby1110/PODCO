<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import type { Snippet } from 'svelte';

	let {
		id,
		action = '/clientes?/updateClient',
		isEditing = false,
		label = 'Custom',
		children
	}: {
		id: string;
		action?: string;
		isEditing?: boolean;
		label?: string;
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
		<section>
			<div class="header">
				{#if label}
					<h3>{label}:</h3>
				{/if}
			</div>
			<div class="content">
				{#if children}
					{@render children()}
				{/if}

				<button
					type="submit"
					class="butter matcha"
					disabled={isSubmitting}
					style:opacity={isSubmitting ? 0.5 : 1}
					style:cursor={isSubmitting ? 'not-allowed' : 'pointer'}
				>
					Guardar
				</button>
			</div>
		</section>
	</form>
{/if}
