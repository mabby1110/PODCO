<script lang="ts" generics="T">
	type Option = {
		value: T;
		label: string;
	};

	let {
		title,
		options,
		defaultOption = 'seleccionar...',
		selected = $bindable()
	}: {
		title?: string;
		options: Option[];
		defaultOption?: string;
		selected: T | undefined;
	} = $props();
</script>

<div class="select-container">
	{#if title}
		<h3>
			{title}
		</h3>
	{/if}
	<select bind:value={selected}>
		<option value="" selected>{defaultOption}</option>
		{#each options as option}
			<option value={option.value}>
				{option.label}
			</option>
		{/each}
	</select>
</div>

<style>
    .select-container h3{
        margin-bottom: var(--a);
    }
</style>