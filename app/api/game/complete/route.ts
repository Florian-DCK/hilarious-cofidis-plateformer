export async function POST(req: Request) {
	// brancher Prisma ici plus tard; pour l’instant on log seulement
	const body = await req.json().catch(() => ({}));
	console.log('GAME COMPLETE', body);
	return new Response(JSON.stringify({ ok: true }), {
		headers: { 'content-type': 'application/json' },
	});
}
