import * as Phaser from "phaser";

export class Debug {
  private scene: Phaser.Scene;
  private debugKey: Phaser.Input.Keyboard.Key;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.debugKey = this.scene.input.keyboard!.addKey(
      Phaser.Input.Keyboard.KeyCodes.D
    );

    // The debug graphic is created automatically when enabling debug mode
    // in the game's physics config, or can be created like this.
    // Let's ensure it has a reasonable alpha.
    this.scene.physics.world.createDebugGraphic().setAlpha(0.5);
    this.scene.physics.world.drawDebug = false;

    this.scene.events.on("shutdown", this.shutdown, this);
  }

  update() {
    if (Phaser.Input.Keyboard.JustDown(this.debugKey)) {
      this.scene.physics.world.drawDebug = !this.scene.physics.world.drawDebug;
      if (!this.scene.physics.world.drawDebug) {
        this.scene.physics.world.debugGraphic.clear();
      }
    }
  }

  private shutdown() {
    // No-op now, but good practice to keep for cleanup
  }
}
