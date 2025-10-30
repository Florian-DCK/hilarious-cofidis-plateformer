import * as Phaser from "phaser";

export class Obstacle extends Phaser.Physics.Arcade.Sprite {
  private obstacleType: string;
  private direction: "horizontal" | "vertical";
  private amplitude: number;
  private startingPosition: number;
  private initialX: number;
  private initialY: number;
  private moveTween?: Phaser.Tweens.Tween;
  private speed: number = 50; // pixels par seconde
  private duration: number; // durée du mouvement en ms

  constructor(scene: Phaser.Scene, x: number, y: number) {
    // Utiliser une texture par défaut (sera changée lors de l'initialisation)
    super(scene, x, y, "thunder");

    // Valeurs par défaut
    this.obstacleType = "thunder";
    this.direction = "horizontal";
    this.amplitude = 100;
    this.startingPosition = 0;
    this.initialX = x;
    this.initialY = y;
    this.speed = 50;
    this.duration = 2000; // 2 secondes par défaut

    // Ajouter à la scène
    scene.add.existing(this);
    scene.physics.add.existing(this, true); // true = static body comme pour Flag
  }

  /**
   * Méthode pour initialiser l'obstacle avec ses propriétés spécifiques
   */
  public initialize(
    obstacleType: string,
    direction: "horizontal" | "vertical",
    amplitude: number,
    startingPosition: number
  ): void {
    this.obstacleType = obstacleType;
    this.direction = direction;
    this.amplitude = amplitude;
    this.startingPosition = startingPosition;

    // Changer la texture selon le type
    const textureKey = obstacleType === "thunder" ? "thunder" : "obstacle";
    this.setTexture(textureKey);

    // Ajuster la vitesse et la durée selon le type d'obstacle
    switch (obstacleType) {
      case "thunder":
        this.speed = 100;
        break;
      default:
        this.speed = 50;
    }

    // Calculer la durée basée sur la vitesse et l'amplitude
    this.duration = (this.amplitude / this.speed) * 1000; // convertir en ms

    // Configurer le corps physique
    const body = this.body as Phaser.Physics.Arcade.StaticBody;

    // Ajuster la hitbox selon le type d'obstacle
    if (obstacleType === "thunder") {
      // Pour le thunder, la hitbox doit être centrée sur les éclairs, pas sur tout le nuage
      body.setSize(this.width * 0.4, this.height * 0.6); // Hitbox plus petite pour les éclairs
      body.setOffset(this.width * 0.3, this.height * 0.6); // Décaler vers le bas (zone des éclairs)
    }

    // Positionner l'obstacle à sa position de départ et démarrer le mouvement
    this.startMovement();
  }

  /**
   * Démarre le mouvement de l'obstacle avec des tweens
   */
  private startMovement(): void {
    // Nettoyer le tween existant s'il y en a un
    if (this.moveTween) {
      this.moveTween.destroy();
    }

    // Calculer les positions de début et de fin basées sur l'amplitude et la direction
    const halfAmplitude = this.amplitude / 2;

    let startPos: { x?: number; y?: number } = {};
    let endPos: { x?: number; y?: number } = {};

    if (this.direction === "horizontal") {
      // Calculer le centre du mouvement basé sur startingPosition
      const centerX =
        this.initialX +
        (this.startingPosition / 100) * this.amplitude -
        halfAmplitude;
      startPos = { x: centerX - halfAmplitude };
      endPos = { x: centerX + halfAmplitude };

      // Positionner l'obstacle à sa position de départ
      const startOffset = (this.startingPosition / 100) * this.amplitude;
      this.setPosition(
        this.initialX + startOffset - halfAmplitude,
        this.initialY
      );
    } else {
      // Direction verticale
      const centerY =
        this.initialY -
        (this.startingPosition / 100) * this.amplitude +
        halfAmplitude;
      startPos = { y: centerY + halfAmplitude };
      endPos = { y: centerY - halfAmplitude };

      // Positionner l'obstacle à sa position de départ
      const startOffset = (this.startingPosition / 100) * this.amplitude;
      this.setPosition(
        this.initialX,
        this.initialY - startOffset + halfAmplitude
      );
    }

    // Créer le tween avec un mouvement de va-et-vient
    this.moveTween = this.scene.tweens.add({
      targets: this,
      ...endPos,
      duration: this.duration,
      ease: "Sine.easeInOut", // Mouvement plus fluide
      yoyo: true, // Retour automatique
      repeat: -1, // Répétition infinie
      onUpdate: () => {
        // Mettre à jour le corps physique à chaque frame
        this.updatePhysicsBody();
      },
    });
  }

  /**
   * Met à jour le corps physique statique
   */
  private updatePhysicsBody(): void {
    if (this.body) {
      const body = this.body as Phaser.Physics.Arcade.StaticBody;
      body.x = this.x - body.offset.x;
      body.y = this.y - body.offset.y;
      body.updateFromGameObject();
    }
  }

  /**
   * Méthode update simplifiée - les tweens gèrent le mouvement automatiquement
   */
  public update(time: number, delta: number): void {
    // Plus besoin de logique de mouvement manuel, les tweens s'occupent de tout
    // Cette méthode peut être utilisée pour d'autres logiques si nécessaire
  }

  public getObstacleType(): string {
    return this.obstacleType;
  }

  public getDirection(): "horizontal" | "vertical" {
    return this.direction;
  }

  public getAmplitude(): number {
    return this.amplitude;
  }

  public getCurrentPosition(): number {
    // Calculer la position relative basée sur la position actuelle de l'obstacle
    if (this.direction === "horizontal") {
      const centerX =
        this.initialX +
        (this.startingPosition / 100) * this.amplitude -
        this.amplitude / 2;
      return this.x - centerX;
    } else {
      const centerY =
        this.initialY -
        (this.startingPosition / 100) * this.amplitude +
        this.amplitude / 2;
      return centerY - this.y;
    }
  }

  /**
   * Pause le mouvement de l'obstacle
   */
  public pauseMovement(): void {
    if (this.moveTween) {
      this.moveTween.pause();
    }
  }

  /**
   * Reprend le mouvement de l'obstacle
   */
  public resumeMovement(): void {
    if (this.moveTween) {
      this.moveTween.resume();
    }
  }

  /**
   * Arrête et nettoie le tween de mouvement
   */
  public stopMovement(): void {
    if (this.moveTween) {
      this.moveTween.destroy();
      this.moveTween = undefined;
    }
  }

  /**
   * Change la vitesse de l'obstacle en cours de mouvement
   */
  public setSpeed(newSpeed: number): void {
    this.speed = newSpeed;
    this.duration = (this.amplitude / this.speed) * 1000;

    // Redémarrer le mouvement avec la nouvelle vitesse
    this.stopMovement();
    this.startMovement();
  }
}
