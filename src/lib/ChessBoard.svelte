<script lang="ts">
	import { Chessground } from 'chessground';
	import type { Key } from 'chessground/types';
	import { onMount } from 'svelte';

	import { move, chess, getLegalDests, reset } from '$lib/chess/chessStore';
	import { getBestMove } from '$lib/chess/stockfish';

	let { playerColor = 'white' }: { playerColor?: 'white' | 'black' } = $props();

	let container: HTMLDivElement;
	let board: ReturnType<typeof Chessground>;

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

	onMount(() => {
		reset();

		const initialTurn = chess.turn() === 'w' ? 'white' : 'black';

		board = Chessground(container, {
			fen: chess.fen(),
			movable: {
				free: true,
				color: initialTurn,
				dests: getLegalDests(chess),
				events: {
					after: (from, to) => {
						const m = move(from, to);
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

		if (playerColor === 'black') {
			setTimeout(() => makeAIMove(), 500);
		}
	});
</script>

<div class="h-[630px] w-[630px]" bind:this={container}></div>
