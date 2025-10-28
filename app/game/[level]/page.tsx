// app/game/[level]/page.tsx
import fs from 'node:fs/promises';
import path from 'node:path';
import GameClient from './GameClient';

export default async function LevelPage({
	params,
}: {
	params: Promise<{ level?: string }>;
}) {
	const resolvedParams = await params;
	if (!resolvedParams || !resolvedParams.level) {
		return (
			<div>
				Erreur : paramètre level manquant. Reçu :{' '}
				{JSON.stringify(resolvedParams)}
			</div>
		);
	}
	const { level } = resolvedParams;
	const file = path.join(process.cwd(), 'game-levels', `level-${level}.json`);
	let levelData;
	try {
		levelData = JSON.parse(await fs.readFile(file, 'utf8'));
	} catch (_) {
		return <div>Erreur : le niveau demandé n’existe pas.</div>;
	}
	return (
		<div className="min-h-[calc(100vh-64px)]">
			<div style={{ color: 'red' }}>Debug : level = {level}</div>
			<GameClient level={Number(level)} levelData={levelData} />
		</div>
	);
}
