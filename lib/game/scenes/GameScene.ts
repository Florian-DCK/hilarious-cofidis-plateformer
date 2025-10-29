import * as Phaser from "phaser";
import { Player } from "../entities/Player";
import { Sun } from "../entities/Sun";
import { Debug } from "../utils/Debug";

export class GameScene extends Phaser.Scene {
  private player?: Player;
  private suns!: Phaser.Physics.Arcade.StaticGroup;
  private sunsCount: number = 0;
  private health: number = 4;
  private debug?: Debug;
  private collisionGroup?: Phaser.Physics.Arcade.StaticGroup;
  private platformDebugGraphics?: Phaser.GameObjects.Graphics;

  private bgSky?: Phaser.GameObjects.Image;
  private bgMountains?: Phaser.GameObjects.Image;
  private bgTreesFar?: Phaser.GameObjects.Image;
  private bgClouds?: Phaser.GameObjects.Image;
  private foregroundLayer?: Phaser.GameObjects.Image;

  constructor() {
    super({ key: "GameScene" });
  }
  private platformCollisionProcess(
    playerGO: Phaser.GameObjects.GameObject,
    platformGO: Phaser.GameObjects.GameObject
  ) {
    const passable =
      (platformGO as any).getData && (platformGO as any).getData("passable");
    if (!passable) return true;

    const player = playerGO as Phaser.Physics.Arcade.Sprite;
    const pBody = player.body as Phaser.Physics.Arcade.Body | undefined;
    const platBody = (platformGO as any).body as
      | Phaser.Physics.Arcade.Body
      | undefined;

    if (!pBody || !platBody) return true;

    const EPS = 8;

    const isFallingOrDown = pBody.velocity.y >= 0;
    const prev = (pBody as any).prev;
    const prevBottom = prev
      ? prev.y + pBody.height
      : pBody.bottom - Math.max(1, Math.abs(pBody.velocity.y));

    const platformTop = (platBody as any).y ?? (platBody as any).top ?? 0;

    return isFallingOrDown && prevBottom <= platformTop + EPS;
  }

  create() {
    this.debug = new Debug(this);
    this.platformDebugGraphics = this.add.graphics().setDepth(98);

    const map = this.make.tilemap({ key: "level_map" });
    const worldHeight = map.heightInPixels;
    const worldWidth = map.widthInPixels;

    const CAMERA_DEFAULT_ZOOM = 0.6;
    this.cameras.main.setZoom(CAMERA_DEFAULT_ZOOM);

    this.bgSky = this.add.image(0, worldHeight, "sky").setOrigin(0, 1);
    this.bgSky.setScrollFactor(1);

    this.bgClouds = this.add
      .image(0, worldHeight / 4, "clouds")
      .setOrigin(0, 1);
    this.bgClouds.setScrollFactor(0.3);

    this.bgMountains = this.add
      .image(-200, worldHeight, "mountains")
      .setOrigin(0, 1)
      .setScale(2);
    this.bgMountains.setScrollFactor(0.75);

    this.bgTreesFar = this.add
      .image(0, worldHeight, "trees")
      .setOrigin(0, 1)
      .setScale(1.5);
    this.bgTreesFar.setScrollFactor(1);

    this.foregroundLayer = this.add
      .image(0, worldHeight, "level_bg")
      .setOrigin(0, 1);

    const collisionLayer =
      map.getObjectLayer("Collisions") ??
      map.getObjectLayer("Collision") ??
      map.getObjectLayer("collision");
    this.collisionGroup = this.physics.add.staticGroup();

    if (collisionLayer && Array.isArray(collisionLayer.objects)) {
      collisionLayer.objects.forEach((obj) => {
        const x = (obj as any).x ?? 0;
        const y = (obj as any).y ?? 0;
        const width = (obj as any).width ?? 0;
        const height = (obj as any).height ?? 0;

        const rect = this.add.rectangle(x, y, width, height).setOrigin(0, 0);

        const props = (obj as any).properties;
        if (Array.isArray(props)) {
          const passableProp = props.find(
            (p: any) => p && p.name === "passable"
          );
          if (
            passableProp &&
            (passableProp.value === true || passableProp.value === "true")
          ) {
            rect.setData("passable", true);
          }
        }

        this.collisionGroup!.add(rect);
      });
    } else {
      console.warn(
        'Tilemap object layer "Collisions" not found. No collision objects created.'
      );
    }

    this.player = new Player(this, 100, 100);

    this.physics.add.collider(
      this.player,
      this.collisionGroup,
      undefined,
      this.platformCollisionProcess as any,
      this
    );

    this.suns = this.physics.add.staticGroup({
      classType: Sun,
    });

    const sunsLayer = map.getObjectLayer("Suns");
    if (sunsLayer) {
      sunsLayer.objects.forEach((sunObject) => {
        if (sunObject.x && sunObject.y) {
          const sun = this.suns.get(sunObject.x, sunObject.y);
          if (sun) {
            sun.setOrigin(0, 1);
            sun.refreshBody();
          }
        }
      });
    }

    this.physics.add.overlap(
      this.player,
      this.suns,
      this.handleCollectSun,
      undefined,
      this
    );

    this.cameras.main.startFollow(this.player);

    // this.debug = new Debug(this); // <-- Supprimez cette ligne

    this.physics.world.setBounds(
      0,
      0,
      map.widthInPixels,
      map.heightInPixels,
      true,
      true,
      false,
      false
    );
    this.player.setCollideWorldBounds(true);
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    this.scene.launch("UIScene");
    this.events.emit("sunsChanged", this.sunsCount);
    this.events.emit("healthChanged", this.health);
  }

  private handleCollectSun(player: any, sun: any) {
    // On s'assure que l'objet est bien une instance de notre classe Sun
    const sunObject = sun as Sun;
    sunObject.collect();
    this.sunsCount++;
    this.events.emit("sunsChanged", this.sunsCount);
  }

  private drawPlatformDebugFill() {
    if (!this.platformDebugGraphics) return;

    this.platformDebugGraphics.clear();

    if (this.physics.world.drawDebug && this.collisionGroup) {
      // Couleur pour les plateformes solides (bleu)
      this.platformDebugGraphics.fillStyle(0x0f08ff, 0.5);
      // Couleur pour les plateformes traversables (jaune)
      const passableColor = 0xffff00;

      this.collisionGroup.getChildren().forEach((platform) => {
        const body = platform.body as Phaser.Physics.Arcade.Body;
        if (!body) return;

        const isPassable = (platform as any).getData("passable");
        if (isPassable) {
          this.platformDebugGraphics?.fillStyle(passableColor, 0.5);
        }

        this.platformDebugGraphics?.fillRect(
          body.x,
          body.y,
          body.width,
          body.height
        );

        // Revenir à la couleur par défaut pour la prochaine plateforme
        if (isPassable) {
          this.platformDebugGraphics?.fillStyle(0x0f08ff, 0.5);
        }
      });
    }
  }

  update(time: number, delta: number) {
    if (!this.player || !this.debug) return;

    // Vérifier si le joueur tombe dans le vide
    const voidLimitY = this.physics.world.bounds.height; // Utiliser la hauteur du monde comme limite
    if (this.player.y > voidLimitY) {
      this.health -= 1; // Réduire les points de vie
      this.events.emit("healthChanged", this.health);

      if (this.health <= 0) {
        // Gérer la fin de partie si les vies atteignent zéro
        this.scene.start("GameOverScene");
      } else {
        // Réinitialiser la position du joueur
        this.player.setPosition(100, 100); // Position de départ ou checkpoint
      }
    }

    // La logique de débogage est gérée séparément.
    this.debug.update();
    this.drawPlatformDebugFill();
    // if (this.bgSky) {
    //   this.bgSky.tilePositionX = this.cameras.main.scrollX * 0.1; // Bouge très lentement
    // }
    // if (this.bgMountains) {
    //   this.bgMountains.tilePositionX = this.cameras.main.scrollX * 0.25; // Bouge un peu
    // }
    // if (this.bgTreesFar) {
    //   this.bgTreesFar.tilePositionX = this.cameras.main.scrollX * 0.5; // Bouge plus vite
    // }
  }
}
