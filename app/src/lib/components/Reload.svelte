<script lang="ts">
	import { enhance } from '$app/forms';
</script>

<form method="POST" action="?/reload" use:enhance>
	<button type="submit" class="butter">↻</button>
</form>

<style>
	button {
		font-size: large;
	}
</style>
