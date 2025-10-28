import * as Phaser from 'phaser';

interface LevelLayout {
	name: string;
	width: number;
	height: number;
	layers: Array<{
		data: number[];
		height: number;
		width: number;
	}>;
	player?: {
		spawn: { x: number; y: number };
	};
}

type Ctor = { level: number; levelData: LevelLayout };

export default class GameScene extends Phaser.Scene {
	private level!: number;
	private layout!: LevelLayout;
	private player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
	private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

	constructor(data?: Ctor) {
		super('GameScene');
		if (data) {
			this.level = data.level;
			this.layout = data.levelData;
		}
	}
	init() {
		if (!this.layout) {
			this.level = this.registry.get('level');
			this.layout = this.registry.get('levelData');
		}
	}

	create() {
		const spawn = this.layout?.player?.spawn ?? { x: 64, y: 320 };
		// un “player” 32x32 blanc
		const rt = this.make.renderTexture({ width: 32, height: 32 }, false);
		rt.fill(0xffffff, 1);
		this.textures.addRenderTexture('player32', rt);
		this.player = this.physics.add
			.sprite(spawn.x, spawn.y, 'player32')
			.setCollideWorldBounds(false);
		this.player.setBounce(0).setMaxVelocity(380, 920);
		this.cursors = this.input.keyboard!.createCursorKeys();
		this.cameras.main.setBackgroundColor('#0b0b0b');
	}

	update() {
		const speed = 260;
		this.player.setVelocityX(
			this.cursors.left?.isDown
				? -speed
				: this.cursors.right?.isDown
				? speed
				: 0
		);
		const onFloor =
			(this.player.body as Phaser.Physics.Arcade.Body).blocked.down ||
			this.player.body.touching.down;
		if (this.cursors.up?.isDown && onFloor) this.player.setVelocityY(-520);

		// “fin de niveau” minimale
		if (this.player.x > 1000) {
			fetch('/api/game/complete', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({
					level: this.level,
					stars: 1,
					detail: { demo: true },
				}),
			}).catch(() => {});
			window.location.href = '/game';
		}
		if (this.player.y > this.scale.height + 200)
			this.player.setPosition(64, 320);
	}
}
