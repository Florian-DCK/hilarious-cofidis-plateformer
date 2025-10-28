import * as Phaser from 'phaser';

export function makeConfig(
	parent: HTMLElement,
	initData: Record<string, unknown>
): Phaser.Types.Core.GameConfig {
	return {
		type: Phaser.AUTO,
		parent,
		backgroundColor: '#0b0b0b',
		pixelArt: true,
		roundPixels: true,
		scale: {
			mode: Phaser.Scale.RESIZE,
			autoCenter: Phaser.Scale.CENTER_BOTH,
			width: parent.clientWidth,
			height: parent.clientHeight,
		},
		physics: {
			default: 'arcade',
			arcade: { gravity: { x: 0, y: 1200 }, debug: false },
		},
		fps: { target: 60, forceSetTimeOut: true },
		banner: false,
		callbacks: { postBoot: (game) => game.registry.merge(initData) },
	};
}
