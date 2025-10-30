import * as Phaser from "phaser";

export class MovingPlateform extends Phaser.Physics.Arcade.Sprite {
  private initialX: number;
  private initialY: number;
  private amplitude: number;
  private direction: "horizontal" | "vertical";
  private startingPosition: number;
  private movementTween?: Phaser.Tweens.Tween;
  private isMoving: boolean = false;
  private previousX: number = 0;
  private previousY: number = 0;
  private playersOnPlatform: Set<Phaser.Physics.Arcade.Sprite> = new Set();

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
    super(scene, x, y, texture);

    this.initialX = x;
    this.initialY = y;
    this.amplitude = 100; // Valeur par défaut
    this.direction = "horizontal"; // Valeur par défaut
    this.startingPosition = 0; // Valeur par défaut

    scene.add.existing(this);
    scene.physics.add.existing(this, true);
    this.setOrigin(0, 0); // Origine en haut à gauche pour correspondre au JSON

    // Le body sera configuré après l'initialisation des dimensions
  }

  /**
   * Initialise la plateforme mobile avec les propriétés du niveau
   */
  initialize(
    direction: "horizontal" | "vertical" = "horizontal",
    amplitude: number = 100,
    startingPosition: number = 0,
    isMoving: boolean = true
  ) {
    this.direction = direction;
    this.amplitude = amplitude;
    this.startingPosition = startingPosition;
    this.isMoving = isMoving;

    // Configurer le body de physique après que les dimensions soient définies
    const body = this.body as Phaser.Physics.Arcade.StaticBody;
    if (body) {
      body.setSize(this.displayWidth, this.displayHeight);
    }

    if (this.isMoving) {
      this.startMovement();
    }
  }

  private startMovement() {
    // Calculer la position de départ basée sur le pourcentage
    const startOffset = (this.startingPosition / 100) * this.amplitude;

    let fromX = this.initialX;
    let fromY = this.initialY;
    let toX = this.initialX;
    let toY = this.initialY;

    if (this.direction === "horizontal") {
      fromX = this.initialX - startOffset;
      toX = this.initialX + (this.amplitude - startOffset);
    } else {
      fromY = this.initialY - startOffset;
      toY = this.initialY + (this.amplitude - startOffset);
    }

    // Positionner la plateforme à sa position de départ
    this.setPosition(fromX, fromY);

    // Initialiser la position précédente
    this.previousX = fromX;
    this.previousY = fromY;

    // Créer le tween de mouvement
    this.movementTween = this.scene.tweens.add({
      targets: this,
      x: toX,
      y: toY,
      duration: 3000, // 3 secondes pour parcourir l'amplitude complète
      ease: "Sine.easeInOut",
      yoyo: true, // Retour automatique
      repeat: -1, // Répétition infinie
      onUpdate: () => {
        // Calculer le déplacement de la plateforme
        const deltaX = this.x - this.previousX;
        const deltaY = this.y - this.previousY;

        // Déplacer tous les joueurs qui sont sur la plateforme
        this.playersOnPlatform.forEach((player) => {
          if (player.active && player.body) {
            const playerBody = player.body as Phaser.Physics.Arcade.Body;

            // Vérifier si le joueur est toujours en contact avec la plateforme
            const isOnPlatform = this.isPlayerOnPlatform(player);

            if (isOnPlatform) {
              // Déplacer le joueur avec la plateforme
              player.x += deltaX;
              player.y += deltaY;

              // Ajuster la position du body si nécessaire
              if (playerBody) {
                playerBody.updateFromGameObject();
              }
            } else {
              // Le joueur n'est plus sur la plateforme
              this.playersOnPlatform.delete(player);
            }
          }
        });

        // Sauvegarder la position actuelle pour le prochain frame
        this.previousX = this.x;
        this.previousY = this.y;

        // Mettre à jour le body de physique pendant le mouvement
        const body = this.body as Phaser.Physics.Arcade.StaticBody;
        if (body) {
          body.updateFromGameObject();
        }
      },
    });
  }

  /**
   * Arrête le mouvement de la plateforme
   */
  stopMovement() {
    if (this.movementTween) {
      this.movementTween.stop();
      this.movementTween = undefined;
    }
  }

  /**
   * Reprend le mouvement de la plateforme
   */
  resumeMovement() {
    if (!this.movementTween && this.isMoving) {
      this.startMovement();
    }
  }

  /**
   * Vérifie si un joueur est actuellement sur la plateforme
   */
  private isPlayerOnPlatform(player: Phaser.Physics.Arcade.Sprite): boolean {
    if (!player.body || !this.body) return false;

    const playerBody = player.body as Phaser.Physics.Arcade.Body;
    const platformBody = this.body as Phaser.Physics.Arcade.StaticBody;

    // Vérifier si le joueur touche le dessus de la plateforme
    const tolerance = 5; // Tolérance en pixels
    const playerBottom = playerBody.bottom;
    const platformTop = platformBody.top;

    // Le joueur doit être au-dessus de la plateforme et dans sa zone horizontale
    return (
      Math.abs(playerBottom - platformTop) <= tolerance &&
      playerBody.right > platformBody.left &&
      playerBody.left < platformBody.right &&
      playerBody.velocity.y >= 0 // Le joueur tombe ou est stable
    );
  }

  /**
   * Ajoute un joueur à la liste des joueurs sur la plateforme
   */
  addPlayer(player: Phaser.Physics.Arcade.Sprite) {
    this.playersOnPlatform.add(player);
  }

  /**
   * Retire un joueur de la liste des joueurs sur la plateforme
   */
  removePlayer(player: Phaser.Physics.Arcade.Sprite) {
    this.playersOnPlatform.delete(player);
  }

  /**
   * Vérifie si un joueur donné est sur la plateforme
   */
  hasPlayer(player: Phaser.Physics.Arcade.Sprite): boolean {
    return this.playersOnPlatform.has(player);
  }

  /**
   * Met à jour la plateforme (appelé depuis GameScene)
   */
  update(time: number, delta: number) {
    // Les tweens gèrent automatiquement le mouvement,
    // mais on peut ajouter ici d'autres logiques si nécessaire
  }

  /**
   * Nettoie les ressources avant destruction
   */
  destroy(fromScene?: boolean) {
    this.stopMovement();
    this.playersOnPlatform.clear();
    super.destroy(fromScene);
  }
}
