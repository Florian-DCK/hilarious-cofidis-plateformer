export async function POST(req: Request) {
	const body = await req.json().catch(() => ({}));
	console.log('GAME COMPLETE', body);
	// Ici: Prisma pour sauver stars/attempt/etc.
	return new Response(JSON.stringify({ ok: true }), {
		headers: { 'content-type': 'application/json' },
	});
}
