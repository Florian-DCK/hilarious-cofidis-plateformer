import { NextResponse } from "next/server";
import { PrismaClient } from "../../../generated/prisma/client";
import { verifySession } from "@/lib/dal";
import { number } from "zod";

export async function POST(request: Request) {
  return new Response("Not implemented", { status: 501 });
}

export async function GET(request: Request) {
  const session = await verifySession();

  if (!session || !session.isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rawUserId = (session as any).userId;
  const userId =
    typeof rawUserId === "string" ? parseInt(rawUserId, 10) : Number(rawUserId);

  if (!Number.isFinite(userId) || Number.isNaN(userId)) {
    return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
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
      // Add more levels as needed
    }

    // Define available levels (based on folder structure)
    const availableLevels = ["1", "2", "3", "4"]; // Hardcoded for now, can be dynamic

    // Determine next level and finished status
    const lastCompletedLevel =
      completedLevels.length > 0 ? Math.max(...completedLevels.map(Number)) : 0;

    const nextLevel =
      lastCompletedLevel < availableLevels.length
        ? (lastCompletedLevel + 1).toString()
        : null;

    const finished = completedLevels.length === availableLevels.length;

    // Determine completed and not completed levels
    const levelsStatus = availableLevels.map((level) => {
      const levelProgress = progress[0] || {}; // Ensure progress[0] is defined
      return {
        level,
        completed: completedLevels.includes(level),
        numberOfStarsCollected: (() => {
          switch (level) {
            case "1":
              return levelProgress.FirstLevelStars; // Keep null as null
            case "2":
              return levelProgress.SecondLevelStars;
            case "3":
              return levelProgress.ThirdLevelStars;
            case "4":
              return levelProgress.FourthLevelStars;
            default:
              return null;
          }
        })(),
      };
    });

    return NextResponse.json({
      levels: levelsStatus,
      nextLevel,
      finished,
    });
  } finally {
    await prisma.$disconnect();
  }
}
