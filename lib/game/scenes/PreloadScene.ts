import * as Phaser from "phaser";

export class PreloadScene extends Phaser.Scene {
  private level: string;
  constructor(level: string = "1") {
    super({ key: "PreloadScene" });
    this.level = level;
  }

  init(data: { level: number }) {
    this.level = data.level.toString();
  }

  preload() {
    this.load.image("level_bg", `/image/assets/${this.level}/plateformes.png`);
    this.load.image("clouds", `/image/assets/${this.level}/Clouds.png`);
    this.load.image("mountains", `/image/assets/${this.level}/bg-far.png`);
    this.load.image("trees", `/image/assets/${this.level}/bg-near.png`);
    this.load.image("sky", `/image/assets/${this.level}/Sky.png`);

    this.load.spritesheet(
      "player",
      `/image/assets/${this.level}/character.png`,
      {
        frameWidth: 325,
        frameHeight: 325,
      }
    );

    this.load.tilemapTiledJSON(
      "level_map",
      `/image/assets/${this.level}/level.json`
    );

    this.load.image("sun", `/image/assets/${this.level}/sun.png`);
    this.load.image("flag", `/image/assets/${this.level}/flag.png`);

    this.load.image("heart-full", `/image/assets/${this.level}/heart-full.png`);
    this.load.image(
      "heart-empty",
      `/image/assets/${this.level}/heart-empty.png`
    );

    // Charger les textures des obstacles
    this.load.image("thunder", `/image/assets/${this.level}/thunder.png`);
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
