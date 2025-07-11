<script lang="ts">
	import { history } from '$lib/chess/chessStore';
</script>

<div class="h-full w-2xl rounded-md bg-[#ffffff17] p-3 pb-8 text-sm">
	<h1>Moves History:</h1>
	<ol class="list-decimal pl-4">
		{#each $history as move, i}
			<li>{move}</li>
		{/each}
	</ol>
</div>
