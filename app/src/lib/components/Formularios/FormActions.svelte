<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import type { Snippet } from 'svelte';
	import NavButton from '../Acciones/NavButton.svelte';

	let {
		action,
		isOpen = $bindable(false),
		onSuccess,
		inputs,
		hiddenContent,
		submitContent
	}: {
		action: string;
		isOpen: boolean;
		onSuccess?: () => void;
		inputs?: Snippet;
		hiddenContent?: Snippet;
		submitContent?: Snippet<[boolean]>;
	} = $props();

	let isSubmitting = $state(false);
	let actionsElement = $state<HTMLElement | null>(null);

	$effect(() => {
		if (isOpen && actionsElement) {
			actionsElement.scrollIntoView({
				behavior: 'smooth',
				block: 'start'
			});
		}
	});

	function handleSubmit() {
		isSubmitting = true;
		return async ({ result, update }: any) => {
			if (result.type === 'success') {
				isSubmitting = false;
				isOpen = false;
				if (onSuccess) onSuccess();
				await update({ reset: true });
				alert('actualizado con exito');
			}

			await invalidateAll();
		};
	}
</script>

<div class="form-actions">
	<form method="POST" {action} enctype="multipart/form-data" use:enhance={handleSubmit}>
		{#if isOpen && inputs}
			<div class="inputs milk" bind:this={actionsElement}>
				{@render inputs()}
			</div>
		{/if}
		{#if hiddenContent}
			{@render hiddenContent()}
		{/if}
		{#if submitContent}
			<div class="submit">
				{@render submitContent(isSubmitting)}
				<NavButton />
			</div>
		{/if}
	</form>
</div>

<style>
	.form-actions {
		width: 100%;
		z-index: 99;
	}
	.inputs {
		display: flex;
		flex-direction: column;
		padding: var(--a);
		gap: var(--b);
	}
	.submit {
		position: fixed;
		bottom: var(--a);
		right: var(--a);
		display: flex;
		flex-wrap: wrap-reverse;
		justify-content: flex-end;
		gap: var(--a);
		padding: var(--a);
	}
</style>
