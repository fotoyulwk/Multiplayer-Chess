<script lang="ts">
	import ChessBoard from '$lib/ChessBoard.svelte';
	import HystoryPanel from '$lib/HystoryPanel.svelte';
</script>

<main
	class="flex h-screen w-screen items-center justify-center gap-4 bg-radial-[at_15%_15%] from-[#0b3636] via-[#082727] to-[#072323] to-90% p-32"
>
	<div class="inline-block rounded-md bg-[#ffffff17] p-3 pb-8">
		<ChessBoard />
	</div>
	<HystoryPanel />
</main>
