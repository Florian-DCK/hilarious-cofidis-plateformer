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
        .setOrigin(0, 0);
      this.hearts.push(heart);
      this.add(heart);
    }

    this.scene.add.existing(this);
  }

  public setHealth(health: number) {
    for (let i = 0; i < this.maxHealth; i++) {
      if (i < health) {
        this.hearts[i].setTexture("heart-full");
      } else {
        this.hearts[i].setTexture("heart-empty");
      }
    }
  }
}
