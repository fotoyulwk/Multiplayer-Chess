<script lang="ts">
	import ChessBoard from '$lib/ChessBoard.svelte';
	import HystoryPanel from '$lib/HystoryPanel.svelte';

	let playerColor: 'white' | 'black' = $state('white');

	function toggleColor() {
		playerColor = playerColor === 'white' ? 'black' : 'white';
	}
</script>

<main
	class="flex h-screen w-screen items-center justify-center gap-4 bg-radial-[at_15%_15%] from-[#0b3636] via-[#082727] to-[#072323] to-90% p-32"
>
	<div class="flex flex-col items-center gap-3">
		<button
			class="cursor-pointer rounded-md bg-[#ffffff17] px-4 py-2 text-sm text-white/80 transition hover:bg-[#ffffff25] hover:text-white"
			onclick={toggleColor}
		>
			{playerColor === 'white' ? 'Play as Black' : 'Play as White'}
		</button>
		<div class="inline-block rounded-md bg-[#ffffff17] p-3 pb-8">
			{#key playerColor}
				<ChessBoard {playerColor} />
			{/key}
		</div>
	</div>
	<HystoryPanel />
</main>
