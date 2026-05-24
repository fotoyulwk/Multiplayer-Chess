import { writable } from 'svelte/store';
import { Chess, SQUARES } from 'chess.js';

export const chess = new Chess();
export const history = writable<string[]>([]);
export const fen = writable<string>(chess.fen());

export function getLegalDests(chess: Chess) {
	const dests = new Map();
	SQUARES.forEach((sq) => {
		const piece = chess.get(sq);
		if (piece && piece.color === chess.turn()) {
			const moves = chess.moves({ square: sq, verbose: true });
			dests.set(sq, moves.map((m) => m.to));
		}
	});
	return dests;
}

export function move(from: string, to: string) {
	const m = chess.move({ from, to, promotion: 'q' });
	fen.set(chess.fen());
	history.set(chess.history());
	return m;
}

export function undo() {
	chess.undo();
	fen.set(chess.fen());
	history.set(chess.history());
}

export function reset() {
	chess.reset();
	fen.set(chess.fen());
	history.set(chess.history());
}
