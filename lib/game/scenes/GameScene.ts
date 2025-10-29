import * as Phaser from "phaser";
import { Player } from "../entities/Player";
import { Debug } from "../utils/Debug";

export class GameScene extends Phaser.Scene {
  private player?: Player;
  private debug?: Debug;
  private collisionGroup?: Phaser.Physics.Arcade.StaticGroup;
  private platformDebugGraphics?: Phaser.GameObjects.Graphics;

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
    // Instancier le débogage en premier
    this.debug = new Debug(this);
    this.platformDebugGraphics = this.add.graphics().setDepth(98); // Juste en dessous du joueur

    const map = this.make.tilemap({ key: "level_map" });

    this.add.image(0, map.heightInPixels, "level_bg").setOrigin(0, 1);

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

    this.cameras.main.startFollow(this.player);

    // this.debug = new Debug(this); // <-- Supprimez cette ligne

    const CAMERA_DEFAULT_ZOOM = 0.6;
    this.cameras.main.setZoom(CAMERA_DEFAULT_ZOOM);

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
          this.platformDebugGraphics.fillStyle(passableColor, 0.5);
        }

        this.platformDebugGraphics.fillRect(
          body.x,
          body.y,
          body.width,
          body.height
        );

        // Revenir à la couleur par défaut pour la prochaine plateforme
        if (isPassable) {
          this.platformDebugGraphics.fillStyle(0x0f08ff, 0.5);
        }
      });
    }
  }

  update(time: number, delta: number) {
    if (!this.player || !this.debug) return;

    // La logique du joueur est maintenant dans sa propre méthode preUpdate,
    // qui est appelée automatiquement par Phaser.
    // this.player.update(time, delta);

    // La logique de débogage est gérée séparément.
    this.debug.update();
    this.drawPlatformDebugFill();
  }
}
