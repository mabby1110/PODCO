<script lang="ts" generics="T">
    type Option = {
        value: T;
        label: string;
    };

    let {
        options,
        defaultOption = 'seleccionar...',
        selected = $bindable()
    }: {
        options: Option[];
        defaultOption: string;
        selected: T | undefined;
    } = $props();
</script>

<select bind:value={selected}>
    <option value="" selected>{defaultOption}</option>
    {#each options as option}
        <option value={option.value}>
            {option.label}
        </option>
    {/each}
</select>