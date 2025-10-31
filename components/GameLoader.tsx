"use client";

import dynamic from "next/dynamic";

const PhaserGame = dynamic(() => import("@/components/PhaserGame"), {
  ssr: false,
});

interface GameLoaderProps {
  level?: string;
  paused?: boolean;
}

export default function GameLoader({ level, paused = false }: GameLoaderProps) {
  return <PhaserGame level={level} paused={paused} />;
}
