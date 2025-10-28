// app/game/[level]/engine/logic.ts
import { makeInput } from "./input";
import { aabb, resolvePlatform } from "./collisions";
import { clear, rect } from "./sprites";
import type { LevelLayout, Rect } from "./types";

type MakeEngineOpts = {
  level: number;
  levelData: LevelLayout;
  onFinish: (res: { stars: number; detail: FinishDetail }) => void;
};

type FinishDetail = {
  level: number;
  collected?: number;
  starsMax?: number;
  failed?: boolean;
};

type Player = {
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  vy: number;
  onGround: boolean;
  hearts: number;
};

type MovingPlatform = {
  x: number;
  y: number;
  w: number;
  h: number;
  type: "moving";
  dx?: number;
  dy?: number;
  speed?: number;
  t: number;
};

type Sun = {
  x: number;
  y: number;
  w: number;
  h: number;
  grabbed: boolean;
};

type Storm = {
  yMin: number;
  yMax: number;
  speed: number;
  x: number;
  y: number;
};

type RockDef = {
  type: "fallingRock";
  spawn: { x: number };
  intervalMs: number;
};

type GameState = {
  L: LevelLayout;
  player: Player;
  platforms: Rect[];
  moving: MovingPlatform[];
  suns: Sun[];
  storms: Storm[];
  rocks: Rect[];
  nextRock: number;
  rockDef: RockDef | undefined;
  collected: number;
  cameraX: number;
  time: number;
  goal: Rect;
};

export function makeEngine(canvas: HTMLCanvasElement, opts: MakeEngineOpts) {
  const ctx = canvas.getContext("2d")!;
  const DPR = Math.max(1, Math.floor(window.devicePixelRatio || 1));
  const ZOOM = 1; // Facteur de zoom (1 = normal, > 1 = zoom avant, < 1 = zoom arrière)
  // Taille fixe du monde de jeu (largeur x hauteur)
  const WORLD_WIDTH = 12000;
  const WORLD_HEIGHT = 789;
  const input = makeInput(canvas);

  // Fonction utilitaire: convertit Y depuis le bas (y=0 en bas) vers coordonnées écran (y=0 en haut)
  const resolveY = (y: number, height = 0) => WORLD_HEIGHT - y - height;

  const state = initFromLevel(opts.levelData);

  let raf = 0,
    running = true,
    last = performance.now();

  function resize() {
    const cssW = canvas.clientWidth,
      cssH = canvas.clientHeight;
    canvas.width = Math.floor(cssW * DPR);
    canvas.height = Math.floor(cssH * DPR);
    ctx.setTransform(DPR * ZOOM, 0, 0, DPR * ZOOM, 0, 0);
  }
  resize();

  function loop(now: number) {
    if (!running) return;
    const dt = Math.min(33, now - last) / 1000;
    last = now;
    update(state, dt, input);
    draw(state);
    raf = requestAnimationFrame(loop);
  }
  raf = requestAnimationFrame(loop);

  function dispose() {
    running = false;
    cancelAnimationFrame(raf);
    input.dispose();
  }
  return { resize, dispose };

  // ----------- internals ------------

  function initFromLevel(L: LevelLayout) {
    const player = {
      x: L.player.spawn.x,
      y: resolveY(L.player.spawn.y, 200 / 3),
      w: 160,
      h: 200,
      vx: 0,
      vy: 0,
      onGround: false,
      hearts: 4,
    };
    const platforms: Rect[] = L.platforms.map((p) => ({
      x: p.x,
      y: resolveY(p.y, p.h),
      w: p.w,
      h: p.h,
    }));
    const moving = L.platforms
      .filter((p) => p.type === "moving")
      .map((p) => ({
        ...p,
        type: "moving" as const,
        t: 0,
        y: resolveY(p.y, p.h),
      }));
    const suns = L.collectables.map((c) => ({
      x: c.x,
      y: resolveY(c.y, 18),
      w: 18,
      h: 18,
      grabbed: false,
    }));
    const storms = L.obstacles
      .filter((o) => o.type === "storm")
      .map((o) => {
        if (o.type === "storm") {
          return {
            yMin: o.path.yMin,
            yMax: o.path.yMax,
            speed: o.speed,
            x: 600,
            y: o.path.yMin,
          };
        }
        throw new Error("Invalid storm obstacle");
      });
    const rocks: Rect[] = [];
    const nextRock = 0;
    const rockDef = L.obstacles.find((o) => o.type === "fallingRock") as
      | RockDef
      | undefined;

    const goal = {
      x: L.goal.x,
      y: resolveY(L.goal.y, L.goal.h),
      w: L.goal.w,
      h: L.goal.h,
    };

    return {
      L,
      player,
      platforms,
      moving,
      suns,
      storms,
      rocks,
      nextRock,
      rockDef,
      collected: 0,
      cameraX: 0,
      time: 0,
      goal,
    };
  }

  function update(
    s: GameState,
    dt: number,
    input: ReturnType<typeof makeInput>
  ) {
    s.time += dt;

    // plateformes mobiles
    s.moving.forEach((m) => {
      m.t += dt * (m.speed ?? 1);
      const nx = m.x + Math.sin(m.t) * (m.dx ?? 0);
      const ny = m.y + Math.cos(m.t) * (m.dy ?? 0);
      // “déplace” la hitbox associée
      const idx = s.platforms.findIndex(
        (p: Rect) => p.x === m.x && p.y === m.y && p.w === m.w && p.h === m.h
      );
      if (idx >= 0) s.platforms[idx] = { x: nx, y: ny, w: m.w, h: m.h };
    });

    // input → vitesse
    const speed = 260;
    s.player.vx = input.left() ? -speed : input.right() ? speed : 0;

    // gravité + saut
    s.player.vy += 1600 * dt;
    if (input.up() && s.player.onGround) s.player.vy = -850;
    s.player.onGround = false;

    // intégration
    s.player.x += s.player.vx * dt;
    s.player.y += s.player.vy * dt;

    // collisions plateformes
    for (const p of s.platforms) {
      if (aabb(s.player, p)) {
        const hit = resolvePlatform(s.player, p);
        if (hit === "top") {
          /* ok */
        }
      }
    }

    // collectables
    for (const c of s.suns) {
      if (!c.grabbed && aabb(s.player, c)) {
        c.grabbed = true;
        s.collected++;
      }
    }

    // orages (oscillation verticale + dégâts)
    s.storms.forEach((st) => {
      const r = (Math.sin(s.time * st.speed) + 1) / 2;
      st.y = st.yMin + (st.yMax - st.yMin) * r;
      const hb = { x: st.x, y: st.y, w: 40, h: 40 };
      if (aabb(s.player, hb)) hit(s, false);
    });

    // pierres qui tombent
    if (s.rockDef && s.time > s.nextRock) {
      s.rocks.push({ x: s.rockDef.spawn.x, y: -30, w: 18, h: 18 });
      s.nextRock = s.time + s.rockDef.intervalMs / 1000;
    }
    s.rocks.forEach((r: Rect) => {
      r.y += 300 * dt;
      if (aabb(s.player, r)) {
        r.y = 9999;
        hit(s, false);
      }
    });
    s.rocks = s.rocks.filter((r: Rect) => r.y < WORLD_HEIGHT);

    // chute hors écran (au-delà de la hauteur du monde)
    if (s.player.y > WORLD_HEIGHT) hit(s, true);

    // caméra: suivi fluide du joueur
    const viewW = canvas.clientWidth / ZOOM;

    // Limites du monde (fixées)
    const worldMinX = 0;
    const worldMaxX = WORLD_WIDTH;

    // Calcul position caméra centrée sur le joueur (40% de la largeur)
    let targetCameraX = s.player.x - viewW * 0.4;

    // Bloquer la caméra aux limites du monde
    targetCameraX = Math.max(
      worldMinX,
      Math.min(targetCameraX, worldMaxX - viewW)
    );

    s.cameraX = targetCameraX;

    // goal → fin
    if (aabb(s.player, s.goal)) {
      const stars = Math.min(s.collected, s.L.starsMax);
      opts.onFinish({
        stars,
        detail: {
          level: opts.level,
          collected: s.collected,
          starsMax: s.L.starsMax,
        },
      });
    }
  }

  function hit(s: GameState, fromFall: boolean) {
    if (s.player.hearts <= 0) return;
    s.player.hearts--;
    if (fromFall) {
      s.player.x = s.L.player.spawn.x;
      s.player.y = s.L.player.spawn.y;
      s.player.vx = s.player.vy = 0;
    }
    if (s.player.hearts <= 0) {
      opts.onFinish({ stars: 0, detail: { level: opts.level, failed: true } });
    }
  }

  function draw(s: GameState) {
    clear(ctx, canvas.width, canvas.height, "#0b0b0b");

    // Parallaxe (couleurs placeholder)
    s.L.parallax?.forEach((layer, i: number) => {
      ctx.save();
      const ox = -s.cameraX * (layer.speed ?? 0.1);
      ctx.translate(ox, 0);
      ctx.fillStyle = layer.color ?? ["#0c0c28", "#111", "#161616"][i % 3];
      ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);
      ctx.restore();
    });

    ctx.save();
    ctx.translate(-s.cameraX, 0);

    // plateformes
    ctx.fillStyle = "#3c3c3c";
    s.platforms.forEach((p: Rect) => rect(ctx, p.x, p.y, p.w, p.h, "#3c3c3c"));

    // goal
    rect(ctx, s.goal.x, s.goal.y, s.goal.w, s.goal.h, "#44cc66");

    // player
    rect(ctx, s.player.x, s.player.y, s.player.w, s.player.h, "#fff");

    // suns
    s.suns.forEach((c) => {
      if (!c.grabbed) rect(ctx, c.x, c.y, c.w, c.h, "#ffd54a");
    });

    // storms
    s.storms.forEach((st) => rect(ctx, st.x, st.y, 40, 40, "#668cff"));

    // rocks
    s.rocks.forEach((r: Rect) => rect(ctx, r.x, r.y, r.w, r.h, "#a78bfa"));

    ctx.restore();

    // UI (top fixed)
    ctx.fillStyle = "#fff";
    ctx.font = "16px system-ui";
    ctx.textBaseline = "top";
    ctx.fillText(`☀ ${s.collected} / ${s.L.starsMax}`, 12, 10);

    // PV
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = i < s.player.hearts ? "#ff4455" : "#555";
      ctx.fillRect(canvas.clientWidth - 18 - i * 20, 12, 14, 14);
    }
  }
}
