import GameLoader from "@/components/GameLoader";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/dal";
import { PrismaClient } from "../../../generated/prisma/client";

type Props = {
  params: { level: string };
};

// Fonction pour récupérer le progrès du joueur
async function getPlayerProgress() {
  try {
    const session = await verifySession();

    if (!session || !session.isAuth) {
      return null;
    }

    const rawUserId = (session as any).userId;
    const userId =
      typeof rawUserId === "string"
        ? parseInt(rawUserId, 10)
        : Number(rawUserId);

    if (!Number.isFinite(userId) || Number.isNaN(userId)) {
      return null;
    }

    const prisma = new PrismaClient();
    try {
      // Fetch user progress
      const progress = await prisma.gameTry.findMany({
        where: { user_id: userId },
      });

      // Extract completed levels based on stars (null = not played, 0+ = completed)
      const completedLevels: string[] = [];
      if (progress.length > 0) {
        const userProgress = progress[0];
        if (userProgress.FirstLevelStars !== null) completedLevels.push("1");
        if (userProgress.SecondLevelStars !== null) completedLevels.push("2");
        if (userProgress.ThirdLevelStars !== null) completedLevels.push("3");
        if (userProgress.FourthLevelStars !== null) completedLevels.push("4");
      }

      // Define available levels
      const availableLevels = ["1", "2", "3", "4"];

      // Determine next level
      const lastCompletedLevel =
        completedLevels.length > 0
          ? Math.max(...completedLevels.map(Number))
          : 0;

      const nextLevel =
        lastCompletedLevel < availableLevels.length
          ? (lastCompletedLevel + 1).toString()
          : null;

      return { nextLevel };
    } finally {
      await prisma.$disconnect();
    }
  } catch (error) {
    console.error("Erreur lors de la récupération du progrès:", error);
    return null;
  }
}

export default async function JeuPage({ params }: Props) {
  const { level } = await params; // Attendre que `params` soit résolu

  // Récupérer le progrès du joueur
  const progress = await getPlayerProgress();

  // Si on n'arrive pas à récupérer le progrès ou si le niveau demandé
  // n'est pas le prochain niveau autorisé, rediriger vers /game
  if (!progress || !progress.nextLevel || level !== progress.nextLevel) {
    redirect("/game");
  }

  return (
    <main>
      <Suspense fallback={<div>Chargement du composant de jeu...</div>}>
        <GameLoader level={level} />
      </Suspense>
    </main>
  );
}
