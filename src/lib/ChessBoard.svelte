<script lang="ts">
	import { Chessground } from 'chessground';
	import type { Key } from 'chessground/types';

	import { chessStore } from '$lib/chess/chessStore.svelte';
	import type { Chat } from '@ai-sdk/svelte';

	let { chat }: { chat: Chat } = $props();

	let container: HTMLDivElement;
	let board: ReturnType<typeof Chessground>;

	function updateBoard(lastMove?: { from: string; to: string }) {
		const dests = chessStore.getLegalDests();
		const isLocked = chat.status === 'streaming' || chessStore.chess.turn() === 'b';
		board.set({
			fen: chessStore.fen,
			turnColor: chessStore.chess.turn() === 'w' ? 'white' : 'black',
			movable: {
				color: isLocked ? undefined : 'white',
				dests
			},
			lastMove: lastMove ? ([lastMove.from, lastMove.to] as Key[]) : undefined
		});
	}

	function handleUserMove(from: string, to: string) {
		const m = chessStore.move(from, to);
		if (!m) return;

		updateBoard(m);

		const fen = chessStore.fen;
		const hist = chessStore.history.join(',');
		chat.sendMessage({ text: `I moved ${m.san}` }, { body: { fen, history: hist } });
	}

	$effect(() => {
		if (typeof window === 'undefined') return;

		board = Chessground(container, {
			fen: chessStore.fen,
			movable: {
				free: false,
				color: 'white',
				dests: chessStore.getLegalDests(),
				events: {
					after: handleUserMove
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
	});

	$effect(() => {
		const msgs = chat.messages;
		if (!msgs.length) return;

		const last = msgs[msgs.length - 1];
		if (last.role !== 'assistant') return;

		for (const part of last.parts) {
			if (part.type === 'tool-makeChessMove' && part.state === 'output-available') {
				const output = part.output as { success: boolean; from: string; to: string; san: string };
				if (!output.success) continue;

				try {
					const m = chessStore.move(output.from, output.to);
					if (m) updateBoard(m);
				} catch {
					// Already applied - skip silently
				}
			}

			if (part.type === 'tool-resetGame' && part.state === 'output-available') {
				const output = part.output as { success: boolean };
				if (output.success) {
					chessStore.reset();
					chat.messages = [];
					updateBoard();
				}
			}
		}
	});
</script>

<div class="h-[630px] w-[630px]" bind:this={container}></div>
