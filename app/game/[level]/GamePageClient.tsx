'use client';

import { useEffect, useState } from "react";
import GameLoader from "@/components/GameLoader";
import Tutorial from "@/components/tutorial";

interface GamePageClientProps {
  level: string;
  showTutorial: boolean;
}

export default function GamePageClient({ level, showTutorial }: GamePageClientProps) {
  const [isTutorialVisible, setIsTutorialVisible] = useState(showTutorial);

  useEffect(() => {
    setIsTutorialVisible(showTutorial);
  }, [showTutorial]);

  return (
    <>
      {isTutorialVisible && (
        <Tutorial onClose={() => setIsTutorialVisible(false)} />
      )}
      <GameLoader level={level} paused={isTutorialVisible} />
    </>
  );
}
