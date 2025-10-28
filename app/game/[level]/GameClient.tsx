'use client';
import { useEffect, useRef } from 'react';
import * as Phaser from 'phaser';
import { makeConfig } from '@/app/phaser/config';
import PreloadScene from '@/app/phaser/scenes/PreloadScene';
import GameScene from '@/app/phaser/scenes/GameScene';
import UIScene from '@/app/phaser/scenes/UIScene';

interface LevelData {
	level: number;
	layout: {
		name: string;
		width: number;
		height: number;
		layers: Array<{
			data: number[];
			height: number;
			width: number;
		}>;
	};
}

export default function GameClient({
	level,
	levelData,
}: {
	level: number;
	levelData: LevelData;
}) {
	const host = useRef<HTMLDivElement>(null);
	const gameRef = useRef<Phaser.Game | null>(null);

	useEffect(() => {
		if (!host.current) return;
		if (gameRef.current) {
			gameRef.current.destroy(true);
			gameRef.current = null;
		}

		const config = makeConfig(host.current, {
			level,
			layout: levelData.layout,
		});
		config.scene = [
			new PreloadScene(),
			new GameScene({ level, levelData: levelData.layout }),
			new UIScene(),
		];
		const game = new Phaser.Game(config);
		gameRef.current = game;

		const onResize = () => game.scale.refresh();
		window.addEventListener('resize', onResize);
		return () => {
			window.removeEventListener('resize', onResize);
			game.destroy(true);
		};
	}, [level, levelData]);

	return <div ref={host} className="w-full h-[calc(100vh-64px)] bg-black" />;
}
