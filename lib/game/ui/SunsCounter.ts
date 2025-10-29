import * as Phaser from "phaser";

export class SunsCounter extends Phaser.GameObjects.Container {
  private sunsCount: number;
  private countText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);

    this.sunsCount = 0;

    const sunImage = this.scene.add.image(0, 0, "sun").setOrigin(0, 0);

    this.countText = this.scene.add
      .text(sunImage.displayWidth + 5, sunImage.displayHeight / 2, "x 0", {
        fontSize: "60px",
        color: "#fff",
        fontFamily: "Pixelify Sans",
      })
      .setOrigin(0, 0.5);

    this.add([sunImage, this.countText]);

    this.scene.add.existing(this);
  }

  public incrementSuns() {
    this.setSuns(this.sunsCount + 1);
  }

  public setSuns(count: number) {
    this.sunsCount = count;
    this.updateCountText();
  }

  public getSunsCount(): number {
    return this.sunsCount;
  }

  private updateCountText() {
    this.countText.setText(`x ${this.sunsCount}`);
  }
}
