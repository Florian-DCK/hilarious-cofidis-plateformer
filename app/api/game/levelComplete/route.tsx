import { NextRequest, NextResponse } from "next/server";

interface LevelCompleteRequest {
  level: number;
  sunsCollected: number;
  timeElapsed?: number;
  score?: number;
}

export async function POST(request: NextRequest) {
  try {
    const data: LevelCompleteRequest = await request.json();

    // Validation des données
    if (!data.level || typeof data.sunsCollected !== "number") {
      return NextResponse.json(
        { error: "Données invalides. Level et sunsCollected sont requis." },
        { status: 400 }
      );
    }

    // Ici, vous pouvez ajouter la logique pour:
    // - Sauvegarder le score dans la base de données
    // - Calculer les récompenses
    // - Débloquer le niveau suivant
    // - Mettre à jour les statistiques du joueur

    console.log(
      `Niveau ${data.level} terminé avec ${data.sunsCollected} soleils collectés`
    );

    // Simuler un traitement
    const response = {
      success: true,
      message: `Félicitations ! Niveau ${data.level} terminé !`,
      data: {
        level: data.level,
        sunsCollected: data.sunsCollected,
        timeElapsed: data.timeElapsed || 0,
        score: data.score || data.sunsCollected * 100,
        nextLevelUnlocked: data.level + 1,
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la completion du niveau:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
