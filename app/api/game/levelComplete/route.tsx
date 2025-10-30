import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma/client";
import { verifySession } from "@/lib/dal";

const prisma = new PrismaClient();

interface LevelCompleteRequest {
  level: number;
  sunsCollected: number;
  timeElapsed?: number;
  score?: number;
}

export async function POST(request: NextRequest) {
  try {
    // Vérifier la session utilisateur
    const session = await verifySession();
    const userId =
      typeof session.userId === "string"
        ? parseInt(session.userId)
        : (session.userId as number);

    const data: LevelCompleteRequest = await request.json();

    // Validation des données
    if (!data.level || typeof data.sunsCollected !== "number") {
      return NextResponse.json(
        { error: "Données invalides. Level et sunsCollected sont requis." },
        { status: 400 }
      );
    }

    // Validation du niveau (1-4)
    if (data.level < 1 || data.level > 4) {
      return NextResponse.json(
        { error: "Niveau invalide. Les niveaux valides sont 1-4." },
        { status: 400 }
      );
    }

    // Les étoiles correspondent directement au nombre de suns collectés
    const starsEarned = data.sunsCollected;

    console.log(
      `Niveau ${data.level} terminé avec ${data.sunsCollected} soleils collectés (${starsEarned} étoiles)`
    );

    // Trouver ou créer un GameTry pour cet utilisateur
    let gameTry = await prisma.gameTry.findFirst({
      where: { user_id: userId },
    });

    if (!gameTry) {
      // Créer un nouveau GameTry si aucun n'existe
      gameTry = await prisma.gameTry.create({
        data: {
          user_id: userId,
          FirstLevelStars: data.level === 1 ? starsEarned : null,
          SecondLevelStars: data.level === 2 ? starsEarned : null,
          ThirdLevelStars: data.level === 3 ? starsEarned : null,
          FourthLevelStars: data.level === 4 ? starsEarned : null,
        },
      });
    } else {
      // Mettre à jour le GameTry existant
      const updateData: any = {};

      switch (data.level) {
        case 1:
          // Ne mettre à jour que si on a obtenu plus d'étoiles
          if (
            !gameTry.FirstLevelStars ||
            starsEarned > gameTry.FirstLevelStars
          ) {
            updateData.FirstLevelStars = starsEarned;
          }
          break;
        case 2:
          if (
            !gameTry.SecondLevelStars ||
            starsEarned > gameTry.SecondLevelStars
          ) {
            updateData.SecondLevelStars = starsEarned;
          }
          break;
        case 3:
          if (
            !gameTry.ThirdLevelStars ||
            starsEarned > gameTry.ThirdLevelStars
          ) {
            updateData.ThirdLevelStars = starsEarned;
          }
          break;
        case 4:
          if (
            !gameTry.FourthLevelStars ||
            starsEarned > gameTry.FourthLevelStars
          ) {
            updateData.FourthLevelStars = starsEarned;
          }
          // Si c'est le dernier niveau, marquer comme terminé
          if (starsEarned > 0) {
            updateData.FinishedAt = new Date();
          }
          break;
      }

      // Effectuer la mise à jour seulement s'il y a des changements
      if (Object.keys(updateData).length > 0) {
        gameTry = await prisma.gameTry.update({
          where: { id: gameTry.id },
          data: updateData,
        });
      }
    }

    // Préparer la réponse
    const response = {
      success: true,
      message: `Félicitations ! Niveau ${
        data.level
      } terminé avec ${starsEarned} étoile${starsEarned > 1 ? "s" : ""} !`,
      data: {
        level: data.level,
        sunsCollected: data.sunsCollected,
        starsEarned,
        timeElapsed: data.timeElapsed || 0,
        score: data.score || data.sunsCollected * 100,
        nextLevelUnlocked: data.level < 4 ? data.level + 1 : null,
        isNewRecord: gameTry
          ? data.level === 1
            ? starsEarned === gameTry.FirstLevelStars
            : data.level === 2
            ? starsEarned === gameTry.SecondLevelStars
            : data.level === 3
            ? starsEarned === gameTry.ThirdLevelStars
            : starsEarned === gameTry.FourthLevelStars
          : true,
      },
      redirect: "/game",
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la completion du niveau:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
