import * as Phaser from "phaser";

export class HealthBar extends Phaser.GameObjects.Container {
  private hearts: Phaser.GameObjects.Image[] = [];
  private maxHealth: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    maxHealth: number = 4
  ) {
    super(scene, x, y);
    this.maxHealth = maxHealth;

    for (let i = 0; i < this.maxHealth; i++) {
      const heart = this.scene.add
        .image(i * 40, 0, "heart-full")
        .setOrigin(0, 0)
        .setScale(0.2);
      this.hearts.push(heart);
      this.add(heart);
    }

    this.scene.add.existing(this);
  }

  public setHealth(health: number) {
    for (let i = 0; i < this.maxHealth; i++) {
      const index = this.maxHealth - 1 - i; // Inverser l'ordre des cœurs
      if (i < health) {
        this.hearts[index].setTexture("heart-full");
      } else {
        this.hearts[index].setTexture("heart-empty").setScale(0.8);
      }
    }
  }
}
