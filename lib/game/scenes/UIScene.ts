import * as Phaser from "phaser";
import { SunsCounter } from "../ui/SunsCounter";
import { HealthBar } from "../ui/HealthBar";

export class UIScene extends Phaser.Scene {
  private sunsCounter!: SunsCounter;
  private healthBar!: HealthBar;

  constructor() {
    super({ key: "UIScene" });
  }

  create() {
    this.sunsCounter = new SunsCounter(this, 75, 60);
    this.healthBar = new HealthBar(this, this.cameras.main.width - 200, 85);

    const gameScene = this.scene.get("GameScene");

    gameScene.events.on("sunsChanged", (count: number) => {
      this.sunsCounter.setSuns(count);
    });

    gameScene.events.on("healthChanged", (health: number) => {
      this.healthBar.setHealth(health);
    });
  }
}
