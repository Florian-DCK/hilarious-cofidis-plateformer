"use client";

import { useEffect, useRef } from "react";
import * as Phaser from "phaser";

import { PreloadScene } from "@/lib/game/scenes/PreloadScene";
import { GameScene } from "@/lib/game/scenes/GameScene";
import { UIScene } from "@/lib/game/scenes/UIScene";

interface PhaserGameProps {
  level?: string;
  paused?: boolean;
}

export default function PhaserGame({ level, paused = false }: PhaserGameProps) {
  const gameInstance = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (gameInstance.current) return;

    const container = containerRef.current!;
    const computeAvailableHeight = () => {
      const top = container?.getBoundingClientRect().top ?? 0;
      return Math.max(100, window.innerHeight - top);
    };

    const initialHeight = computeAvailableHeight();
    if (container) {
      container.style.width = "100%";
      container.style.height = `${initialHeight}px`;
    }

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: container ? container.id : "game-container",

      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: window.innerWidth,
        height: initialHeight,
      },

      physics: {
        default: "arcade",
        arcade: {
          gravity: { x: 0, y: 2200 },
          debug: true,
          debugShowBody: true,
          debugShowStaticBody: true,
          debugBodyColor: 0x00ff00,
          debugStaticBodyColor: 0x0f08ff,
          debugShowVelocity: true,
          debugVelocityColor: 0xff1008,
        },
      },

      scene: [PreloadScene, GameScene, UIScene],
    };

  const game = new Phaser.Game(config);
    gameInstance.current = game;

  game.scene.start("PreloadScene", { level, startPaused: paused });

    const onResize = () => {
      const newHeight = computeAvailableHeight();
      if (container) container.style.height = `${newHeight}px`;
      if (gameInstance.current && gameInstance.current.scale) {
        gameInstance.current.scale.resize(window.innerWidth, newHeight);
      }
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      if (gameInstance.current) {
        gameInstance.current.destroy(true);
        gameInstance.current = null;
      }
    };
  }, [level]);

  useEffect(() => {
    const game = gameInstance.current;
    if (!game) {
      return;
    }

    const sceneManager = game.scene;
    const managedScenes = ["GameScene", "UIScene"];

    const toggleSceneState = (key: string) => {
      let sceneExists = true;
      try {
        sceneManager.getScene(key);
      } catch (error) {
        sceneExists = false;
      }

      if (!sceneExists) {
        return;
      }

      const isPaused = typeof sceneManager.isPaused === "function"
        ? sceneManager.isPaused(key)
        : false;
      const isActive = typeof sceneManager.isActive === "function"
        ? sceneManager.isActive(key)
        : false;

      if (paused) {
        if (isActive && !isPaused) {
          sceneManager.pause(key);
        }
        return;
      }

      if (isPaused) {
        sceneManager.resume(key);
      }
    };

    managedScenes.forEach(toggleSceneState);
  }, [paused]);

  return (
    <div
      id="game-container"
      ref={containerRef}
      style={{
        width: "100%",
        height: "300px",
        position: "relative",
      }}
    />
  );
}
