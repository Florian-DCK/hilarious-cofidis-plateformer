import * as Phaser from "phaser";
import { Player } from "../entities/Player";
import { Sun } from "../entities/Sun";
import { Flag } from "../entities/Flag";
import { Obstacle } from "../entities/Obstacle";
import { Debug } from "../utils/Debug";

export class GameScene extends Phaser.Scene {
  private player?: Player;
  private suns!: Phaser.Physics.Arcade.StaticGroup;
  private flags!: Phaser.Physics.Arcade.StaticGroup;
  private obstacles!: Phaser.Physics.Arcade.StaticGroup;
  private sunsCount: number = 0;
  private health: number = 4;
  private debug?: Debug;
  private collisionGroup?: Phaser.Physics.Arcade.StaticGroup;
  private platformDebugGraphics?: Phaser.GameObjects.Graphics;
  private currentLevel: number = 1;
  private levelStartTime: number = 0;
  private isInvincible: boolean = false;
  private invincibilityDuration: number = 2000; // 2 secondes d'invincibilité

  private bgSky?: Phaser.GameObjects.Image;
  private bgMountains?: Phaser.GameObjects.Image;
  private bgTreesFar?: Phaser.GameObjects.Image;
  private bgClouds?: Phaser.GameObjects.Image;
  private foregroundLayer?: Phaser.GameObjects.Image;

  constructor() {
    super({ key: "GameScene" });
  }

  init(data: any) {
    // Récupérer le niveau depuis les données passées à la scène
    this.currentLevel = data?.level || 1;
    this.levelStartTime = Date.now();
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
    this.bgTreesFar.setScrollFactor(0.9);

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

    // Gestion des drapeaux
    this.flags = this.physics.add.staticGroup({
      classType: Flag,
    });

    const flagsLayer =
      map.getObjectLayer("Flag") || map.getObjectLayer("Flags");
    if (flagsLayer) {
      flagsLayer.objects.forEach((flagObject) => {
        if (flagObject.x && flagObject.y) {
          const flag = this.flags.get(flagObject.x, flagObject.y);
          if (flag) {
            flag.setOrigin(0, 1);
            flag.refreshBody();
          }
        }
      });
    }

    this.physics.add.overlap(
      this.player,
      this.flags,
      this.handleFlagTrigger,
      undefined,
      this
    );

    // Gestion des obstacles
    this.obstacles = this.physics.add.staticGroup({
      classType: Obstacle,
    });

    const obstaclesLayer = map.getObjectLayer("Obstacles");
    if (obstaclesLayer) {
      obstaclesLayer.objects.forEach((obstacleObject) => {
        if (obstacleObject.x && obstacleObject.y) {
          // Récupérer les propriétés de l'obstacle
          const props = (obstacleObject.properties as any[]) || [];

          let obstacleType = "thunder";
          let direction: "horizontal" | "vertical" = "horizontal";
          let amplitude = 100;
          let startingPosition = 0;

          props.forEach((prop) => {
            switch (prop.name) {
              case "type":
                obstacleType = prop.value;
                break;
              case "direction":
                direction = prop.value as "horizontal" | "vertical";
                break;
              case "amplitude":
                amplitude = parseFloat(prop.value);
                break;
              case "startingPosition":
                startingPosition = parseFloat(prop.value);
                break;
            }
          });

          // Créer l'obstacle avec les propriétés récupérées
          const obstacle = this.obstacles.get(
            obstacleObject.x,
            obstacleObject.y
          ) as Obstacle;
          if (obstacle) {
            obstacle.setOrigin(0, 1);
            obstacle.initialize(
              obstacleType,
              direction,
              amplitude,
              startingPosition
            );
            obstacle.refreshBody();
          }
        }
      });
    }

    // Collision joueur avec obstacles (cause des dégâts)
    this.physics.add.overlap(
      this.player,
      this.obstacles,
      this.handleObstacleCollision,
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

  private handleFlagTrigger(player: any, flag: any) {
    // On s'assure que l'objet est bien une instance de notre classe Flag
    const flagObject = flag as Flag;
    flagObject.trigger();

    // Appeler l'API pour terminer le niveau
    this.completeLevel();
  }

  private handleObstacleCollision(player: any, obstacle: any) {
    // Si le joueur est invincible, ignorer la collision
    if (this.isInvincible) {
      return;
    }

    // On s'assure que l'objet est bien une instance de notre classe Obstacle
    const obstacleObject = obstacle as Obstacle;

    // Activer l'invincibilité
    this.isInvincible = true;

    // Réduire les points de vie du joueur
    this.health -= 1;
    this.events.emit("healthChanged", this.health);

    // Effet visuel de dégât avec clignotement pendant l'invincibilité
    this.tweens.add({
      targets: this.player,
      alpha: 0.3,
      duration: 150,
      yoyo: true,
      repeat: -1, // Répéter indéfiniment jusqu'à ce qu'on l'arrête
      onComplete: () => {
        if (this.player) {
          this.player.setAlpha(1);
        }
      },
    });

    // Timer pour désactiver l'invincibilité
    this.time.delayedCall(this.invincibilityDuration, () => {
      this.isInvincible = false;

      // Arrêter l'effet de clignotement
      if (this.player) {
        this.tweens.killTweensOf(this.player);
        this.player.setAlpha(1);
      }
    });

    // Vérifier si le joueur n'a plus de vie
    if (this.health <= 0) {
      this.scene.start("GameOverScene");
    }
  }

  private async completeLevel() {
    try {
      const timeElapsed = Date.now() - this.levelStartTime;
      const score = this.sunsCount * 100 + Math.max(0, 300000 - timeElapsed); // Bonus temps

      const response = await fetch("/api/game/levelComplete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          level: this.currentLevel,
          sunsCollected: this.sunsCount,
          timeElapsed: timeElapsed,
          score: score,
        }),
      });

      const result = await response.json();

      if (result.success) {
        console.log("Niveau terminé avec succès:", result);

        // Vérifier s'il y a une redirection dans la réponse
        if (result.redirect) {
          // Rediriger vers la page spécifiée
          window.location.href = result.redirect;
          return;
        }

        // Si pas de redirection, continuer avec la logique habituelle
        // Exemple: transition vers le niveau suivant ou écran de victoire
        this.scene.start("VictoryScene", {
          level: this.currentLevel,
          sunsCollected: this.sunsCount,
          score: result.data.score,
          nextLevel: result.data.nextLevelUnlocked,
        });
      } else {
        console.error("Erreur lors de la completion du niveau:", result.error);
      }
    } catch (error) {
      console.error("Erreur lors de l'appel API:", error);
      // Gérer l'erreur (peut-être afficher un message à l'utilisateur)
    }
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

      // Dessiner les obstacles en rouge
      if (this.obstacles) {
        this.platformDebugGraphics.fillStyle(0xff0000, 0.7);
        this.obstacles.children.entries.forEach((obstacle) => {
          if (obstacle instanceof Obstacle && obstacle.body) {
            const body = obstacle.body as Phaser.Physics.Arcade.StaticBody;
            this.platformDebugGraphics?.fillRect(
              body.x,
              body.y,
              body.width,
              body.height
            );
          }
        });
      }
    }
  }

  update(time: number, delta: number) {
    if (!this.player || !this.debug) return;

    // Mettre à jour tous les obstacles
    if (this.obstacles) {
      this.obstacles.children.entries.forEach((obstacle) => {
        if (obstacle instanceof Obstacle) {
          obstacle.update(time, delta);
        }
      });
    }

    // Vérifier si le joueur tombe dans le vide
    const voidLimitY = this.physics.world.bounds.height; // Utiliser la hauteur du monde comme limite
    if (this.player.y > voidLimitY && !this.isInvincible) {
      // Activer l'invincibilité
      this.isInvincible = true;

      this.health -= 1; // Réduire les points de vie
      this.events.emit("healthChanged", this.health);

      if (this.health <= 0) {
        // Gérer la fin de partie si les vies atteignent zéro
        this.scene.start("GameOverScene");
      } else {
        // Réinitialiser la position du joueur
        this.player.setPosition(100, 100); // Position de départ ou checkpoint

        // Effet visuel de dégât avec clignotement
        this.tweens.add({
          targets: this.player,
          alpha: 0.3,
          duration: 150,
          yoyo: true,
          repeat: -1, // Répéter indéfiniment jusqu'à ce qu'on l'arrête
        });

        // Timer pour désactiver l'invincibilité
        this.time.delayedCall(this.invincibilityDuration, () => {
          this.isInvincible = false;

          // Arrêter l'effet de clignotement
          if (this.player) {
            this.tweens.killTweensOf(this.player);
            this.player.setAlpha(1);
          }
        });
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
