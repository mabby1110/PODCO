<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import type { Snippet } from 'svelte';

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
			isSubmitting = false;

			if (result.type === 'success') {
				isOpen = false;
				if (onSuccess) onSuccess();
				await update({ reset: true });
			}

			await invalidateAll();
		};
	}
</script>
{#if isOpen}
<div class="header">
	<h3>Acciones</h3>
</div>
{/if}
<div class="form-actions">
	<form method="POST" {action} enctype="multipart/form-data" use:enhance={handleSubmit}>
		{#if isOpen}
			<div class="inputs" bind:this={actionsElement}>
				{#if inputs}
					{@render inputs()}
				{/if}
			</div>
		{/if}

		{#if hiddenContent}
			{@render hiddenContent()}
		{/if}

		{#if submitContent}
			<div class="submit panel">
				{@render submitContent(isSubmitting)}
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
		gap: var(--b);
	}
	.submit {
		position: fixed;
		bottom: 0;
		right: var(--a);
		display: flex;
		flex-wrap: wrap-reverse;
		justify-content: flex-end;
		gap: var(--a);
		margin: 0 var(--a) var(--a) var(--e);
		padding: var(--a);
	}
</style>
