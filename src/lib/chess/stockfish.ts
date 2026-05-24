// src/lib/chess/stockfish.ts
export async function getBestMove(fen: string, depth: string = '18') {
	const url = `https://stockfish.online/api/s/v2.php?fen=${fen}&depth=${depth}`;

	const res = await fetch(url);
	const data = await res.json();

	if (data.bestmove) {
		const moveUci = data.bestmove.split(' ')[1];
		if (moveUci && moveUci !== '(none)') {
			return moveUci;
		}
	}
	return null;
}
