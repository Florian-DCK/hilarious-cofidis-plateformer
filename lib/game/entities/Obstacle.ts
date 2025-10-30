import * as Phaser from "phaser";

export class Obstacle extends Phaser.Physics.Arcade.Sprite {
  private obstacleType: string;
  private direction: "horizontal" | "vertical";
  private amplitude: number;
  private startingPosition: number;
  private initialX: number;
  private initialY: number;
  private currentPosition: number = 0; // Position relative au centre (-amplitude/2 à +amplitude/2)
  private moveDirection: number = 1; // 1 pour aller vers la fin, -1 pour revenir
  private speed: number = 50; // pixels par seconde

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
    this.currentPosition = 0;
    this.moveDirection = 1;
    this.speed = 50;

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

    // La startingPosition définit le centre du mouvement (en pourcentage de l'amplitude)
    // L'obstacle oscillera de -amplitude/2 à +amplitude/2 autour de ce centre

    // Calculer la position de départ relative au centre du mouvement
    // startingPosition = 0% -> commence à -amplitude/2 (extrême gauche/bas)
    // startingPosition = 50% -> commence au centre (position 0)
    // startingPosition = 100% -> commence à +amplitude/2 (extrême droite/haut)
    const relativeStart = this.startingPosition / 100 - 0.5; // -0.5 à +0.5
    this.currentPosition = relativeStart * this.amplitude; // -amplitude/2 à +amplitude/2

    // Déterminer la direction initiale basée sur la position de départ relative
    if (this.currentPosition >= 0) {
      this.moveDirection = -1; // Aller vers l'extrême négatif
    } else {
      this.moveDirection = 1; // Aller vers l'extrême positif
    }

    // Configurer le corps physique
    const body = this.body as Phaser.Physics.Arcade.StaticBody;

    // Ajuster la hitbox selon le type d'obstacle
    if (obstacleType === "thunder") {
      // Pour le thunder, la hitbox doit être centrée sur les éclairs, pas sur tout le nuage
      body.setSize(this.width * 0.4, this.height * 0.6); // Hitbox plus petite pour les éclairs
      body.setOffset(this.width * 0.3, this.height * 0.6); // Décaler vers le bas (zone des éclairs)
    }

    // Positionner l'obstacle à sa position de départ
    this.updatePosition();

    // Ajuster la vitesse selon le type d'obstacle
    switch (obstacleType) {
      case "thunder":
        this.speed = 100;
        break;
      default:
        this.speed = 50;
    }
  }

  private updatePosition(): void {
    // Calculer le décalage du centre basé sur startingPosition (en pixels)
    const centerOffsetX =
      this.direction === "horizontal"
        ? (this.startingPosition / 100) * this.amplitude - this.amplitude / 2
        : 0;
    const centerOffsetY =
      this.direction === "vertical"
        ? (this.startingPosition / 100) * this.amplitude - this.amplitude / 2
        : 0;

    const newX =
      this.direction === "horizontal"
        ? this.initialX + centerOffsetX + this.currentPosition
        : this.initialX;
    const newY =
      this.direction === "vertical"
        ? this.initialY - (centerOffsetY + this.currentPosition) // Soustraction pour que les valeurs positives aillent vers le haut
        : this.initialY;

    // Utiliser setPosition pour que Phaser gère correctement la mise à jour
    this.setPosition(newX, newY);

    // Mettre à jour explicitement le corps physique statique
    if (this.body) {
      const body = this.body as Phaser.Physics.Arcade.StaticBody;

      // Pour un StaticBody, nous devons mettre à jour manuellement les coordonnées du corps
      body.x = newX - body.offset.x;
      body.y = newY - body.offset.y;

      // Mettre à jour les propriétés du corps physique
      body.updateFromGameObject();
    }
  }

  public update(time: number, delta: number): void {
    // Calculer le mouvement basé sur le delta time
    const moveAmount = (this.speed * delta) / 1000; // convertir ms en secondes

    // Mettre à jour la position courante
    this.currentPosition += moveAmount * this.moveDirection;

    // Vérifier les limites et inverser la direction si nécessaire
    // L'obstacle oscille maintenant de -amplitude/2 à +amplitude/2
    const halfAmplitude = this.amplitude / 2;
    if (this.currentPosition >= halfAmplitude) {
      this.currentPosition = halfAmplitude;
      this.moveDirection = -1;
    } else if (this.currentPosition <= -halfAmplitude) {
      this.currentPosition = -halfAmplitude;
      this.moveDirection = 1;
    }

    // Mettre à jour la position physique
    this.updatePosition();
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
    return this.currentPosition;
  }
}
