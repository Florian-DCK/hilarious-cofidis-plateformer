import * as Phaser from "phaser";

export class Flag extends Phaser.Physics.Arcade.Sprite {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    // Créer le sprite avec une texture temporaire (on peut la remplacer plus tard)
    super(scene, x, y, "flag"); // Utilise temporairement la texture du soleil

    // Ajouter le sprite à la scène
    scene.add.existing(this);
    scene.physics.add.existing(this, true); // true = static body

    // Configuration du sprite
    this.setOrigin(0.5, 1); // Ancrage en bas au centre
    this.setScale(1);

    // Configuration du corps physique
    const body = this.body as Phaser.Physics.Arcade.StaticBody;
    if (body) {
      body.setSize(this.width * 0.8, this.height * 0.8);
    }
  }

  /**
   * Méthode appelée quand le joueur touche le drapeau
   */
  public trigger(): void {
    // Animation ou effet visuel lors du déclenchement
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 200,
      yoyo: true,
      ease: "Power2",
    });

    // Émettre un événement pour notifier la GameScene
    this.scene.events.emit("flagTriggered", this);
  }
}
