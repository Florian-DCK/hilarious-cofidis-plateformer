import * as Phaser from "phaser";

export class GameScene extends Phaser.Scene {
  private player?: Phaser.Physics.Arcade.Sprite;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private coyoteTimer = 0;
  private jumpBufferTimer = 0;
  private isJumping = false;
  private debugKey?: Phaser.Input.Keyboard.Key;

  constructor() {
    super({ key: "GameScene" });
  }
  private platformCollisionProcess(
    playerGO: Phaser.GameObjects.GameObject,
    platformGO: Phaser.GameObjects.GameObject
  ) {
    const passable =
      (platformGO as any).getData && (platformGO as any).getData("passable");
    if (!passable) return true;

    const player = playerGO as Phaser.Physics.Arcade.Sprite;
    const pBody = player.body as Phaser.Physics.Arcade.Body | undefined;
    const platBody = (platformGO as any).body as
      | Phaser.Physics.Arcade.Body
      | undefined;

    if (!pBody || !platBody) return true;

    const EPS = 8;

    const isFallingOrDown = pBody.velocity.y >= 0;
    const prev = (pBody as any).prev;
    const prevBottom = prev
      ? prev.y + pBody.height
      : pBody.bottom - Math.max(1, Math.abs(pBody.velocity.y));

    const platformTop = (platBody as any).y ?? (platBody as any).top ?? 0;

    return isFallingOrDown && prevBottom <= platformTop + EPS;
  }

  create() {
    const map = this.make.tilemap({ key: "level_map" });

    this.add.image(0, map.heightInPixels, "level_bg").setOrigin(0, 1);

    const collisionLayer =
      map.getObjectLayer("Collisions") ??
      map.getObjectLayer("Collision") ??
      map.getObjectLayer("collision");
    const collisionGroup = this.physics.add.staticGroup();

    if (collisionLayer && Array.isArray(collisionLayer.objects)) {
      collisionLayer.objects.forEach((obj) => {
        const x = (obj as any).x ?? 0;
        const y = (obj as any).y ?? 0;
        const width = (obj as any).width ?? 0;
        const height = (obj as any).height ?? 0;

        const rect = this.add.rectangle(x, y, width, height).setOrigin(0, 0);

        const props = (obj as any).properties;
        if (Array.isArray(props)) {
          const passableProp = props.find(
            (p: any) => p && p.name === "passable"
          );
          if (
            passableProp &&
            (passableProp.value === true || passableProp.value === "true")
          ) {
            rect.setData("passable", true);
          }
        }

        collisionGroup.add(rect);
      });
    } else {
      console.warn(
        'Tilemap object layer "Collisions" not found. No collision objects created.'
      );
    }

    this.player = this.physics.add.sprite(100, 100, "player", 0);
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.setSize(this.player.width * 0.6, this.player.height);
    body.setDragX(800);
    body.setMaxVelocity(800, 4000);
    this.physics.add.collider(
      this.player,
      collisionGroup,
      undefined,
      this.platformCollisionProcess as any,
      this
    );

    this.cursors = this.input.keyboard!.createCursorKeys();
    this.cameras.main.startFollow(this.player);

    this.debugKey = this.input.keyboard!.addKey(
      Phaser.Input.Keyboard.KeyCodes.D
    );
    this.physics.world.createDebugGraphic();
    this.physics.world.drawDebug = false;

    this.events.on("postupdate", () => {
      if (this.physics.world.drawDebug) {
        const debugGraphic = this.physics.world.debugGraphic;
        debugGraphic.clear();

        // Draw dynamic bodies (player, etc.)
        debugGraphic.fillStyle(0xff0000, 0.25); // Red fill
        debugGraphic.lineStyle(1, 0xff0000, 1); // Red outline
        this.physics.world.bodies.entries.forEach(
          (body: Phaser.Physics.Arcade.Body) => {
            if (body.gameObject) {
              debugGraphic.fillRect(body.x, body.y, body.width, body.height);
              debugGraphic.strokeRect(body.x, body.y, body.width, body.height);
            }
          }
        );

        // Draw static bodies (platforms)
        debugGraphic.fillStyle(0x0000ff, 0.25); // Blue fill
        debugGraphic.lineStyle(1, 0x0000ff, 1); // Blue outline
        this.physics.world.staticBodies.entries.forEach(
          (body: Phaser.Physics.Arcade.StaticBody) => {
            if (body.gameObject) {
              debugGraphic.fillRect(body.x, body.y, body.width, body.height);
              debugGraphic.strokeRect(body.x, body.y, body.width, body.height);
            }
          }
        );
      }
    });

    const CAMERA_DEFAULT_ZOOM = 0.6;
    this.cameras.main.setZoom(CAMERA_DEFAULT_ZOOM);

    this.physics.world.setBounds(
      0,
      0,
      map.widthInPixels,
      map.heightInPixels,
      true,
      true,
      false,
      false
    );
    this.player.setCollideWorldBounds(true);
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
  }

  update(time: number, delta: number) {
    if (!this.player || !this.cursors) return;

    if (this.debugKey && Phaser.Input.Keyboard.JustDown(this.debugKey)) {
      this.physics.world.drawDebug = !this.physics.world.drawDebug;
      if (!this.physics.world.drawDebug) {
        this.physics.world.debugGraphic.clear();
      }
    }

    const body = this.player.body as Phaser.Physics.Arcade.Body | undefined;
    if (!body) return;

    const MOVE_SPEED = 600;
    const ACCELERATION = 2400;
    const JUMP_VELOCITY = -1800;
    const COYOTE_TIME = 120;
    const JUMP_BUFFER = 150;

    // Update timers
    this.coyoteTimer = Math.max(0, this.coyoteTimer - delta);
    this.jumpBufferTimer = Math.max(0, this.jumpBufferTimer - delta);

    const onGround =
      body.blocked.down ||
      body.touching.down ||
      (body.onFloor && body.onFloor());

    // If player just pressed jump, start jump buffer
    if (this.cursors.up && Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
      this.jumpBufferTimer = JUMP_BUFFER;
    }

    // Reset coyote timer when on ground
    if (onGround) {
      this.coyoteTimer = COYOTE_TIME;
      this.isJumping = false;
    }

    if (this.cursors.left?.isDown) {
      body.setAccelerationX(-ACCELERATION);
      this.player.setFlipX(true);
      if (onGround) {
        const vel = Math.abs(body.velocity.x);
        const runTimeScale = Phaser.Math.Clamp(
          0.2 + 0.2 * (vel / MOVE_SPEED),
          0.2,
          0.6
        );
        this.player.anims.play("player-run", true);
        this.player.anims.timeScale = runTimeScale;
      }
    } else if (this.cursors.right?.isDown) {
      body.setAccelerationX(ACCELERATION);
      this.player.setFlipX(false);
      if (onGround) {
        const vel = Math.abs(body.velocity.x);
        const runTimeScale = Phaser.Math.Clamp(
          0.2 + 0.2 * (vel / MOVE_SPEED),
          0.2,
          0.6
        );
        this.player.anims.play("player-run", true);
        this.player.anims.timeScale = runTimeScale;
      }
    } else {
      body.setAccelerationX(0);
      if (onGround) {
        body.setVelocityX(0);
        this.player.anims.play("player-idle", true);
        this.player.anims.timeScale = 1;
      }
    }

    if (this.jumpBufferTimer > 0 && this.coyoteTimer > 0) {
      body.setVelocityY(JUMP_VELOCITY);
      this.isJumping = true;
      this.jumpBufferTimer = 0;
      this.coyoteTimer = 0;
      this.player.anims.play("player-jump", true);
    }

    if (
      this.cursors.up &&
      Phaser.Input.Keyboard.JustUp(this.cursors.up) &&
      body.velocity.y < 0
    ) {
      body.setVelocityY(body.velocity.y * 0.45);
    }

    const worldGravity =
      (this.physics.world &&
        this.physics.world.gravity &&
        this.physics.world.gravity.y) ||
      2200;
    const FALL_MULTIPLIER = 2.6;
    const LOW_JUMP_MULTIPLIER = 1.6;

    if (body.velocity.y > 0) {
      body.setGravityY(worldGravity * FALL_MULTIPLIER);
    } else if (
      body.velocity.y < 0 &&
      !(this.cursors.up && this.cursors.up.isDown)
    ) {
      body.setGravityY(worldGravity * LOW_JUMP_MULTIPLIER);
    } else {
      body.setGravityY(worldGravity);
    }

    if (!onGround) {
      this.player.anims.play("player-jump", true);
    }
  }
}
