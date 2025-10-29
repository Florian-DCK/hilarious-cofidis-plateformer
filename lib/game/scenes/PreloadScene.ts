import * as Phaser from "phaser";

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: "PreloadScene" });
  }

  preload() {
    this.load.image("level_bg", "/image/assets/level-1-plateformes.png");
    this.load.image("clouds", "/image/assets/Clouds.png");
    this.load.image("mountains", "/image/assets/bg-far.png");
    this.load.image("trees", "/image/assets/bg-near.png");
    this.load.image("sky", "/image/assets/Sky.png");

    this.load.spritesheet("player", "/image/assets/level-1-character.png", {
      frameWidth: 325,
      frameHeight: 325,
    });

    this.load.tilemapTiledJSON("level_map", "/image/assets/level-1.json");

    this.load.image("sun", "/image/assets/level-1-sun.png");

    this.load.image("heart-full", "/image/assets/heart-full.png");
    this.load.image("heart-empty", "/image/assets/heart-empty.png");
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
