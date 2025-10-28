// app/game/[level]/page.tsx
import fs from 'node:fs/promises';
import path from 'node:path';
import GameCanvas from '@/components/GameCanvas';

export default async function LevelPage(props: {
	params: Promise<{ level: string }>;
}) {
	const { level } = await props.params;
	const file = path.join(process.cwd(), 'game-levels', `level-${level}.json`);
	const levelData = JSON.parse(await fs.readFile(file, 'utf8'));
	return (
		<div className="h-full">
			<GameCanvas level={Number(level)} levelData={levelData} />
		</div>
	);
}
