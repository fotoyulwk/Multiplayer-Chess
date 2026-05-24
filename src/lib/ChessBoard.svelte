<script lang="ts">
	import { Chessground } from 'chessground';
	import type { Key } from 'chessground/types';
	import { onMount } from 'svelte';

	import { move, chess, getLegalDests, reset } from '$lib/chess/chessStore';
	import { getBestMove } from '$lib/chess/stockfish';

	let { playerColor = 'white' }: { playerColor?: 'white' | 'black' } = $props();

	let container: HTMLDivElement;
	let board: ReturnType<typeof Chessground>;
	let orientation: 'white' | 'black' = $state('white');

	function flipBoard() {
		orientation = orientation === 'white' ? 'black' : 'white';
		board?.set({ orientation });
	}

	function updateBoard(lastMove?: { from: string; to: string }) {
		const dests = getLegalDests(chess);
		board.set({
			fen: chess.fen(),
			turnColor: chess.turn() === 'w' ? 'white' : 'black',
			movable: {
				color: chess.turn() === 'w' ? 'white' : 'black',
				dests
			},
			lastMove: lastMove ? ([lastMove.from, lastMove.to] as Key[]) : undefined
		});
	}

	async function makeAIMove() {
		const best = await getBestMove(chess.fen());
		if (best) {
			const m = move(best.slice(0, 2), best.slice(2, 4));
			if (m) updateBoard(m);
		}
	}

	function tryMove(from: Key, to: Key) {
		try {
			return move(from, to);
		} catch {
			return null;
		}
	}

	onMount(() => {
		reset();

		const initialTurn = chess.turn() === 'w' ? 'white' : 'black';

		board = Chessground(container, {
			fen: chess.fen(),
			orientation,
			movable: {
				free: true,
				color: initialTurn,
				dests: getLegalDests(chess),
				events: {
					after: (from, to) => {
						const m = tryMove(from, to);
						if (!m) return;
						updateBoard(m);
						setTimeout(() => makeAIMove(), 300);
					}
				}
			},
			highlight: {
				lastMove: true,
				check: true
			},
			animation: {
				enabled: true,
				duration: 150
			}
		});

		function onResize() {
			board.redrawAll();
		}
		window.addEventListener('resize', onResize);

		if (playerColor === 'black') {
			setTimeout(() => makeAIMove(), 500);
		}

		return () => {
			window.removeEventListener('resize', onResize);
		};
	});
</script>

<div class="flex w-full flex-col items-center gap-3">
	<div class="aspect-square w-full" bind:this={container}></div>
	<button
		class="cursor-pointer rounded-md bg-[#ffffff17] px-4 py-2 text-sm text-white/80 transition hover:bg-[#ffffff25] hover:text-white"
		onclick={flipBoard}
	>
		Flip Board
	</button>
</div>
