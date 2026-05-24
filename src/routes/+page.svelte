<script lang="ts">
	import ChessBoard from '$lib/ChessBoard.svelte';
	import HystoryPanel from '$lib/HystoryPanel.svelte';

	let playerColor: 'white' | 'black' = $state('white');
	let boardOrientation: 'white' | 'black' = $state('white');

	function toggleColor() {
		playerColor = playerColor === 'white' ? 'black' : 'white';
	}

	function toggleOrientation() {
		boardOrientation = boardOrientation === 'white' ? 'black' : 'white';
	}
</script>

<main
	class="flex min-h-screen flex-col items-center justify-center gap-4 bg-radial-[at_15%_15%] from-[#0b3636] via-[#082727] to-[#072323] to-90% p-4 lg:flex-row lg:p-8"
>
	<div class="flex w-full max-w-[min(90vw,90vh,630px)] flex-col items-center gap-3 lg:w-auto">
		<div class="flex gap-2">
			<button
				class="cursor-pointer rounded-md bg-[#ffffff17] px-4 py-2 text-sm text-white/80 transition hover:bg-[#ffffff25] hover:text-white"
				onclick={toggleColor}
			>
				{playerColor === 'white' ? 'Play as Black' : 'Play as White'}
			</button>
			<button
				class="cursor-pointer rounded-md bg-[#ffffff17] px-4 py-2 text-sm text-white/80 transition hover:bg-[#ffffff25] hover:text-white"
				onclick={toggleOrientation}
			>
				Flip Board
			</button>
		</div>
		<div class="w-full rounded-md bg-[#ffffff17] p-2 sm:p-3 sm:pb-8">
			{#key playerColor}
				<ChessBoard {playerColor} orientation={boardOrientation} />
			{/key}
		</div>
	</div>
	<HystoryPanel />
</main>
