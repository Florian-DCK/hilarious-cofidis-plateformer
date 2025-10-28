// app/game/[level]/GameCanvas.tsx
'use client';
import { useEffect, useRef } from 'react';
import { makeEngine } from '@/engine/logic';
import type { LevelLayout } from '@/engine/types';

export default function GameCanvas({
	level,
	levelData,
}: {
	level: number;
	levelData: LevelLayout;
}) {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const canvas = canvasRef.current!;
		const engine = makeEngine(canvas, {
			level,
			levelData,
			onFinish: (res) => {
				// Envoi progression
				fetch('/api/game/complete', {
					method: 'POST',
					headers: { 'content-type': 'application/json' },
					body: JSON.stringify({ level, stars: res.stars, detail: res.detail }),
				}).finally(() => {
					window.location.href = '/game';
				});
			},
		});

		const onResize = () => engine.resize();
		window.addEventListener('resize', onResize);
		return () => {
			window.removeEventListener('resize', onResize);
			engine.dispose();
		};
	}, [level, levelData]);

	return (
		<canvas
			ref={canvasRef}
			className="w-full h-[calc(100vh-128px)] block bg-black"
		/>
	);
}
