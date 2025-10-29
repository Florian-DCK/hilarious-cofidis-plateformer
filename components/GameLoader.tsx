"use client";

import dynamic from "next/dynamic";

const PhaserGame = dynamic(() => import("@/components/PhaserGame"), {
  ssr: false,
});

interface GameLoaderProps {
  level?: string;
}

export default function GameLoader({ level }: GameLoaderProps) {
  return <PhaserGame level={level} />;
}
