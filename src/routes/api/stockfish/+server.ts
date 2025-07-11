import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json();
	console.log(body);
	const res = await fetch('https://stockfish.online/api/s/v2.php', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			fen: body.fen,
			depth: body.depth
		})
	});

	const text = await res.text();

	return new Response(text, {
		headers: {
			'Content-Type': 'application/json'
		}
	});
};
