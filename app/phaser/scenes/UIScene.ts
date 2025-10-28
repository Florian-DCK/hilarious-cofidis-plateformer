import * as Phaser from 'phaser';
export default class UIScene extends Phaser.Scene {
	constructor() {
		super('UIScene');
	}
	create() {
		this.add
			.text(16, 16, 'Demo Phaser', { fontSize: '18px' })
			.setScrollFactor(0);
	}
}
