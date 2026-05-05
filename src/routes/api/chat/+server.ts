import { streamText, type UIMessage, convertToModelMessages, tool, stepCountIs } from 'ai';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { z } from 'zod';
import { Chess } from 'chess.js';

import { OPENCODE_GO_API_KEY } from '$env/static/private';

const opencode = createOpenAICompatible({
	name: 'opencode',
	baseURL: 'https://opencode.ai/zen/go/v1',
	apiKey: OPENCODE_GO_API_KEY
});

export async function POST({ request }) {
	const { messages, fen, history }: { messages: UIMessage[]; fen: string; history: string } =
		await request.json();

	const isAITurn = fen.split(' ')[1] === 'b';
	const moveCount = history ? history.split(',').filter(Boolean).length : 0;
	const isFirstAITurn = moveCount === 1 && isAITurn;
	const game = new Chess(fen);
	const legalMoves = game.moves({ verbose: true });
	const legalUcis = legalMoves.map((m) => `${m.from}${m.to}`).join(', ');
	const isGameOver = game.isGameOver();
	const isCheckmate = game.isCheckmate();

	let system = `You are BLACK. Current board FEN: ${fen}. History: ${history || 'none'}. Your legal UCI moves: ${legalUcis || 'none'}.

INSTRUCTIONS:
- You play BLACK. Your moves are from black's perspective only.
- Pick a legal UCI move from the list above. Read the list carefully — if your piece was captured, it is no longer on the board.
- Call makeChessMove ONE time. Never call it twice.
- After the tool result, write a short message from YOUR (black's) perspective. Say what YOU did, e.g. "I pushed my pawn to e5" or "My knight moves to f6". Never analyze the user's position.
- If you are losing badly or checkmated, you may resign using the resign tool.
- If the user asks to restart, use the resetGame tool.`;

	if (isGameOver) {
		if (isCheckmate) {
			system +=
				'\n\nThe game is over by CHECKMATE. Congratulate the user or resign gracefully. Do NOT call makeChessMove.';
		} else {
			system += '\n\nThe game is over. Announce the result. Do NOT call makeChessMove.';
		}
	} else if (isFirstAITurn) {
		system +=
			"\n\nThe user just made their first move. Greet them and naturally open a light fun topic, then call the tool to make your move.";
	} else if (isAITurn) {
		system +=
			'\n\nIt is your turn. Call the tool ONCE with a legal move. Then write a quick message.';
	} else if (moveCount === 0) {
		system += "\n\nGame hasn't started. Welcome the user naturally. Do NOT call tools.";
	} else {
		system += "\n\nIt's the user's turn. Chat naturally. Do NOT call tools.";
	}

	const tools: Record<string, unknown> = {};

	if (isAITurn && !isGameOver) {
		tools.makeChessMove = tool({
			description:
				'Make a chess move for BLACK using a legal UCI move from the list in the system prompt.',
			inputSchema: z.object({
				from: z.string().describe('Source square (e.g., e7)'),
				to: z.string().describe('Target square (e.g., e5)'),
				promotion: z.string().optional().describe('Promotion piece (q, r, b, n)')
			}),
			execute: async ({
				from,
				to,
				promotion
			}: {
				from: string;
				to: string;
				promotion?: string;
			}) => {
				if (game.turn() !== 'b') {
					return { success: false, error: 'Not your turn.' };
				}
				const result = game.move({ from, to, promotion: promotion ?? 'q' });
				if (!result) {
					const legal = game.moves({ verbose: true }).map((m) => `${m.from}${m.to}`);
					return { success: false, error: `Illegal: ${from}→${to}`, legal };
				}
				return {
					success: true,
					san: result.san,
					fen: game.fen(),
					from,
					to,
					gameOver: game.isGameOver(),
					turn: game.turn()
				};
			}
		});
	}

	if (isAITurn) {
		tools.resign = tool({
			description: 'Resign the game when you are checkmated or in a hopeless position.',
			inputSchema: z.object({ confirm: z.boolean().describe('Set to true to resign') }),
			execute: async () => {
				return { success: true, resigned: true, message: 'Black resigns. White wins!' };
			}
		});
	}

	tools.resetGame = tool({
		description:
			'Reset the chess game to the starting position. Use this when the user asks to restart.',
		inputSchema: z.object({ confirm: z.boolean().describe('Set to true to reset') }),
		execute: async () => {
			return {
				success: true,
				fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
				message: 'Game has been reset to starting position.'
			};
		}
	});

	try {
		const result = streamText({
			model: opencode('mimo-v2.5-pro'),
			system,
			messages: await convertToModelMessages(messages),
			stopWhen: stepCountIs(3),
			toolChoice: isAITurn ? 'auto' : undefined,
			tools: tools as Record<string, ReturnType<typeof tool>>
		});

		return result.toUIMessageStreamResponse();
	} catch (err) {
		console.error('opencode Go error:', err);
		return new Response(JSON.stringify({ error: 'AI service unavailable' }), {
			status: 503,
			headers: { 'Content-Type': 'application/json' }
		});
	}
}
