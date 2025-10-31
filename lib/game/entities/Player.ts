import * as Phaser from "phaser";

export class Player extends Phaser.Physics.Arcade.Sprite {
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private coyoteTimer = 0;
  private jumpBufferTimer = 0;
  private debugGraphics: Phaser.GameObjects.Graphics;
  private shadow?: Phaser.GameObjects.Graphics;
  private currentLevel: number;

  private readonly MOVE_SPEED = 600;
  private readonly ACCELERATION = 2400;
  private readonly JUMP_VELOCITY = -2000;
  private readonly COYOTE_TIME = 120;
  private readonly JUMP_BUFFER = 150;
  private readonly FALL_MULTIPLIER = 2.6;
  private readonly LOW_JUMP_MULTIPLIER = 1.6;

  constructor(scene: Phaser.Scene, x: number, y: number, level: number = 1) {
    super(scene, x, y, "player-idle", 0);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.currentLevel = level;
    this.initPhysics();
    this.cursors = this.scene.input.keyboard!.createCursorKeys();

    // Création de l'objet Graphics pour le débogage
    this.debugGraphics = this.scene.add.graphics();
    this.debugGraphics.setDepth(99); // Pour s'assurer qu'il est visible

    // Créer l'ombre uniquement pour le niveau 4
    this.createShadow();
  }

  private initPhysics() {
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(150, 256);
    body.setDragX(2300);
    body.setMaxVelocity(800, 4000);
    this.setCollideWorldBounds(true);
  }

  private createShadow() {
    // Créer l'ombre uniquement pour le niveau 4
    console.log("createShadow called, currentLevel:", this.currentLevel);
    if (this.currentLevel === 4) {
      console.log("Creating shadow for level 4");
      this.shadow = this.scene.add.graphics();
      this.shadow.setDepth(50); // Au premier plan temporairement pour debug
      this.setDepth(51);
    }
  }

  private updateShadow() {
    if (!this.shadow || this.currentLevel !== 4) return;

    const body = this.body as Phaser.Physics.Arcade.Body;
    if (!body) return;

    // Effacer l'ombre précédente
    this.shadow.clear();

    // Vérifier si le joueur est sur le sol ou une plateforme
    const onGround = body.blocked.down || body.touching.down;

    // Commençons par une ombre simple pour voir si elle fonctionne
    if (onGround) {
      console.log("Player on ground, drawing shadow");

      // Créer une ombre réaliste avec effet de flou
      const shadowWidth = 120;
      const shadowHeight = 30;
      const shadowCenterX = this.x;
      const shadowCenterY = this.y + this.height / 4 - 5;

      // Dessiner plusieurs couches pour créer un effet de flou complet
      const layers = 8; // Nombre de couches pour l'effet de flou

      for (let layer = layers; layer >= 1; layer--) {
        // Calculer la taille et l'opacité pour chaque couche
        const layerScale = layer / layers;
        const layerWidth = shadowWidth * (0.3 + 0.7 * layerScale);
        const layerHeight = shadowHeight * (0.3 + 0.7 * layerScale);
        const opacity = (0.6 * layerScale) / layers; // Opacité décroissante

        this.shadow.fillStyle(0x000000, opacity);

        // Dessiner une ellipse complète pour chaque couche (avec flou au-dessus et en dessous)
        this.shadow.fillEllipse(
          shadowCenterX,
          shadowCenterY,
          layerWidth,
          layerHeight
        );
      }

      console.log("Half-circle shadow drawn at:", shadowCenterX, shadowCenterY);
    } else {
      console.log("Player not on ground, no shadow");
    }
  }

  preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta);

    const body = this.body as Phaser.Physics.Arcade.Body;
    if (!body) return;

    // Timers
    this.coyoteTimer = Math.max(0, this.coyoteTimer - delta);
    this.jumpBufferTimer = Math.max(0, this.jumpBufferTimer - delta);

    const onGround = body.blocked.down || body.touching.down;

    if (onGround) {
      this.coyoteTimer = this.COYOTE_TIME;
    }

    // Input
    if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
      this.jumpBufferTimer = this.JUMP_BUFFER;
    }

    // Mouvement horizontal
    if (this.cursors.left?.isDown) {
      body.setAccelerationX(-this.ACCELERATION);
      this.setFlipX(true);
    } else if (this.cursors.right?.isDown) {
      body.setAccelerationX(this.ACCELERATION);
      this.setFlipX(false);
    } else {
      body.setAccelerationX(0);
    }

    // Saut
    if (this.jumpBufferTimer > 0 && this.coyoteTimer > 0) {
      body.setVelocityY(this.JUMP_VELOCITY);
      this.jumpBufferTimer = 0;
      this.coyoteTimer = 0;
    }

    // Saut court
    if (
      this.cursors.up &&
      Phaser.Input.Keyboard.JustUp(this.cursors.up) &&
      body.velocity.y < 0
    ) {
      body.setVelocityY(body.velocity.y * 0.45);
    }

    // Gravité améliorée
    const worldGravity = this.scene.physics.world.gravity.y || 2200;
    if (body.velocity.y > 0) {
      body.setGravityY(worldGravity * this.FALL_MULTIPLIER);
    } else if (body.velocity.y < 0 && !this.cursors.up.isDown) {
      body.setGravityY(worldGravity * this.LOW_JUMP_MULTIPLIER);
    } else {
      body.setGravityY(worldGravity);
    }

    // Animations
    this.updateAnimation(onGround);

    // Mise à jour de l'ombre
    this.updateShadow();

    // Dessin du remplissage de débogage
    this.drawDebugFill();
  }

  private updateAnimation(onGround: boolean) {
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (onGround) {
      if (body.velocity.x !== 0) {
        const vel = Math.abs(body.velocity.x);
        const runTimeScale = Phaser.Math.Clamp(
          0.2 + 0.2 * (vel / this.MOVE_SPEED),
          0.2,
          0.6
        );
        this.anims.play("player-run", true);
        this.anims.timeScale = runTimeScale;
      } else {
        this.anims.play("player-idle", true);
        this.anims.timeScale = 1;
      }
    } else {
      this.anims.play("player-jump", true);
    }
  }

  // Nouvelle méthode pour dessiner le remplissage
  private drawDebugFill() {
    this.debugGraphics.clear();
    if (this.scene.physics.world.drawDebug && this.body) {
      const body = this.body as Phaser.Physics.Arcade.Body;
      // Couleur de remplissage (vert, 50% d'opacité)
      this.debugGraphics.fillStyle(0x00ff00, 0.5);
      this.debugGraphics.fillRect(body.x, body.y, body.width, body.height);
    }
  }

  // Bonne pratique : nettoyer les objets créés
  destroy(fromScene?: boolean) {
    this.debugGraphics?.destroy();
    this.shadow?.destroy();
    super.destroy(fromScene);
  }
}
