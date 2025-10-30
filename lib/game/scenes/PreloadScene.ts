import * as Phaser from "phaser";

export class PreloadScene extends Phaser.Scene {
  private level: string;
  constructor(level: string = "1") {
    super({ key: "PreloadScene" });
    this.level = level;
  }

  init(data: { level: string }) {
    this.level = data.level || "1";
  }

  preload() {
    this.load.image("level_bg", `/image/assets/${this.level}/plateformes.png`);
    this.load.image("clouds", `/image/assets/${this.level}/Clouds.png`);
    this.load.image("mountains", `/image/assets/${this.level}/bg-far.png`);
    this.load.image("trees", `/image/assets/${this.level}/bg-near.png`);
    this.load.image("sky", `/image/assets/${this.level}/Sky.png`);

    // Charger les deux spritesheets séparés
    this.load.spritesheet(
      "player-idle",
      `/image/assets/${this.level}/idle.png`,
      {
        frameWidth: 512,
        frameHeight: 512,
      }
    );

    this.load.spritesheet(
      "player-jumping",
      `/image/assets/${this.level}/jumping.png`,
      {
        frameWidth: 512,
        frameHeight: 512,
        endFrame: this.level == "1" ? 4 : this.level == "2" ? 19 : undefined,
      }
    );

    this.load.spritesheet(
      "player-running",
      `/image/assets/${this.level}/running.png`,
      {
        frameWidth: 512,
        frameHeight: 512,
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

    // Charger les textures des plateformes mobiles
    this.load.image(
      "plateform1.png",
      `/image/assets/${this.level}/plateform1.png`
    );
    this.load.image(
      "plateform2.png",
      `/image/assets/${this.level}/plateform2.png`
    );
  }

  create() {
    // Animation idle avec toutes les frames du spritesheet idle
    this.anims.create({
      key: "player-idle",
      frames: this.anims.generateFrameNames("player-idle"),
      frameRate: this.level == "2" ? 12 : 24,
      repeat: -1,
    });

    // Animation running avec toutes les frames du spritesheet running
    this.anims.create({
      key: "player-run",
      frames: this.anims.generateFrameNames("player-running"),
      frameRate: 24,
      repeat: -1,
    });

    // Animation de saut (utilise la première frame du spritesheet idle)
    this.anims.create({
      key: "player-jump",
      frames: this.anims.generateFrameNames("player-jumping"),
      frameRate: 24,
      repeat: -1,
    });

    this.scene.start("GameScene", { level: parseInt(this.level) });
  }
}
