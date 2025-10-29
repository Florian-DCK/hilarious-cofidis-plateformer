import GameLoader from "@/components/GameLoader";
import { Suspense } from "react";

type Props = {
  params: { level: string };
};

export default function JeuPage({ params }: Props) {
  return (
    <main>
      <Suspense fallback={<div>Chargement du composant de jeu...</div>}>
        <GameLoader />
      </Suspense>
    </main>
  );
}
