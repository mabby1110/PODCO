<script lang="ts" generics="T">
    type Option = {
        value: T;
        label: string;
    };

    let {
        options,
        selected = $bindable()
    }: {
        options: Option[];
        selected: T | undefined;
    } = $props();
</script>

<select bind:value={selected}>
    <option value="" disabled selected>Agrupar por</option>
    {#each options as option}
        <option value={option.value}>
            {option.label}
        </option>
    {/each}
</select>