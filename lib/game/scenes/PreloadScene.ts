import * as Phaser from "phaser";

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: "PreloadScene" });
  }

  preload() {
    this.load.image("level_bg", "/image/assets/level-1-plateformes.png");

    this.load.spritesheet("player", "/image/assets/level-1-character.png", {
      frameWidth: 325,
      frameHeight: 325,
    });

    this.load.tilemapTiledJSON("level_map", "/image/assets/level-1.json");
  }

  create() {
    this.anims.create({
      key: "player-idle",
      frames: [{ key: "player", frame: 3 }],
      frameRate: 1,
      repeat: -1,
    });

    this.anims.create({
      key: "player-run",
      frames: this.anims.generateFrameNumbers("player", { start: 0, end: 1 }),
      frameRate: 12,
      repeat: -1,
    });

    this.anims.create({
      key: "player-jump",
      frames: [{ key: "player", frame: 2 }],
      frameRate: 1,
      repeat: -1,
    });

    this.scene.start("GameScene");
  }
}
