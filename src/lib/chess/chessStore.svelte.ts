import { Chess, SQUARES } from 'chess.js';
import type { Key } from 'chessground/types';

class ChessStore {
	chess = $state(new Chess());
	history = $state<string[]>([]);
	fen = $state<string>('');
	moveCount = $state(0);

	constructor() {
		this.fen = this.chess.fen();
	}

	getLegalDests() {
		const dests = new Map<Key, Key[]>();
		SQUARES.forEach((sq) => {
			const moves = this.chess.moves({ square: sq, verbose: true });
			if (moves.length) dests.set(sq as Key, moves.map((m) => m.to as Key));
		});
		return dests;
	}

	move(from: string, to: string) {
		const m = this.chess.move({ from, to, promotion: 'q' });
		if (!m) return null;

		this.fen = this.chess.fen();
		this.history = this.chess.history();
		this.moveCount = this.history.length;
		return m;
	}

	reset() {
		this.chess = new Chess();
		this.fen = this.chess.fen();
		this.history = [];
		this.moveCount = 0;
	}
}

export const chessStore = new ChessStore();
