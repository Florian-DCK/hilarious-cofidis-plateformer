import GameLoader from "@/components/GameLoader";
import { Suspense } from "react";

type Props = {
  params: { level: string };
};

export default async function JeuPage({ params }: Props) {
  const { level } = await params; // Attendre que `params` soit résolu

  return (
    <main>
      <Suspense fallback={<div>Chargement du composant de jeu...</div>}>
        <GameLoader level={level} />
      </Suspense>
    </main>
  );
}
