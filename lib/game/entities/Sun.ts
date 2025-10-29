import * as Phaser from "phaser";

export class Sun extends Phaser.Physics.Arcade.Sprite {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "sun"); // Assurez-vous que 'sun' est la clé de votre image chargée
  }

  /**
   * Appelé lorsque le soleil est collecté.
   */
  collect() {
    // Désactive le corps physique pour éviter d'autres collisions
    this.disableBody(true, true);

    // Vous pouvez ajouter ici une animation ou un son avant de détruire
    this.scene.tweens.add({
      targets: this,
      alpha: { from: 1, to: 0 },
      scale: { from: 1, to: 1.5 },
      ease: "Power2",
      duration: 200,
      onComplete: () => {
        this.destroy(); // Détruit l'objet à la fin de l'animation
      },
    });

    console.log("Sun collected!");
  }
}
