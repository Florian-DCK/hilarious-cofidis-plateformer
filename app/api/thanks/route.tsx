import { NextResponse } from "next/server";
import { PrismaClient } from "../../../generated/prisma/client";
import { verifySession } from "@/lib/dal";
import { ca } from "zod/locales";

export async function GET(request: Request) {
  return NextResponse.json({ message: "GET method not implemented" });
}

export async function POST(request: Request) {
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
    // Fetch user progress and user info
    const progress = await prisma.gameTry.findFirst({
      where: { user_id: userId },
    });

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !progress) {
      return NextResponse.json(
        { error: "User or progress not found" },
        { status: 404 }
      );
    }

    if (progress.FinishedAt === null) {
      return NextResponse.json(
        { error: "Progress not finished" },
        { status: 400 }
      );
    } else if (user.subsidary !== null) {
      return NextResponse.json(
        { message: "Subsidary already submitted" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const subsidaryInput =
      body && typeof body.subsidary === "string" ? body.subsidary.trim() : "";

    if (!subsidaryInput) {
      await prisma.$disconnect();
      return NextResponse.json({ error: "Invalid subsidary" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { subsidary: subsidaryInput },
    });

    await prisma.$disconnect();
    return NextResponse.json(
      { message: "Subsidary updated", subsidary: updatedUser.subsidary },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching user progress:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
