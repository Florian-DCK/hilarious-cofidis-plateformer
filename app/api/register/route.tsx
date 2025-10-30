import { NextResponse } from "next/server";

import { PrismaClient } from "../../../generated/prisma/client";
import { User as UserSchema } from "../../../Validation/zod";
import { createSession } from "@/lib/session";
const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Log du body reçu pour debug
    console.log("BODY RECU:", body);
    // Validation Zod
    const parseResult = UserSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { message: "Validation error", errors: parseResult.error.flatten() },
        { status: 400 }
      );
    }
    const data = parseResult.data;

    // Vérification si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
      include: {
        gameTry: true, // Join GameTry data
      },
    });

    if (existingUser) {
      const gameTry = existingUser.gameTry?.[0];

      // L'utilisateur existe déjà donc on vérifie si les données correspondent
      if (
        existingUser.name !== data.name ||
        existingUser.surname !== data.surname ||
        existingUser.gender !==
          (data.civility === "madame" ? "FEMALE" : "MALE") ||
        existingUser.birthdate.getTime() !==
          (() => {
            const [day, month, year] = data.birthdate
              .split(/[\/\-]/)
              .map((v: string) => Number(v.trim()));
            return new Date(Date.UTC(year, month - 1, day)).getTime();
          })()
      ) {
        //
        // Les données ne correspondent pas
        //
        return NextResponse.json(
          { message: "User data does not match existing record" },
          { status: 409 }
        );
        //
        // L'utilisateur existe et les données correspondent et il n'as pas finis son concours
        //
      } else if (existingUser.subsidary === null) {
        await createSession(
          existingUser.id.toString(),
          existingUser.email,
          gameTry?.FinishedAt?.toISOString() || "",
          existingUser.inscription_date.toISOString(),
          gameTry?.FirstLevelStars || 0,
          gameTry?.SecondLevelStars || 0,
          gameTry?.ThirdLevelStars || 0,
          gameTry?.FourthLevelStars || 0
        );
        return NextResponse.json(
          { message: "User exists but subsidary is null" },
          { status: 422 }
        );
        //
        // L'utilisateur existe et les données correspondent et il as finis son concours
        //
      } else {
        await createSession(
          existingUser.id.toString(),
          existingUser.email,
          gameTry?.FinishedAt?.toISOString() || "",
          existingUser.inscription_date.toISOString(),
          gameTry?.FirstLevelStars || 0,
          gameTry?.SecondLevelStars || 0,
          gameTry?.ThirdLevelStars || 0,
          gameTry?.FourthLevelStars || 0
        );
        return NextResponse.json(
          { message: "User already registered and subsidary is not null" },
          { status: 200 }
        );
      }
    }
    //
    // Création de l'utilisateur dans la BDD si il n'existe pas déjà
    //
    const user = await prisma.user.create({
      data: {
        name: data.name,
        surname: data.surname,
        gender: data.civility === "madame" ? "FEMALE" : "MALE",
        email: data.email,
        birthdate: (() => {
          const [day, month, year] = data.birthdate
            .split(/[\/\-]/)
            .map((v: string) => Number(v.trim()));
          return new Date(Date.UTC(year, month - 1, day));
        })(),
      },
      include: {
        gameTry: true, // Join GameTry data
      },
    });

    const gameTry = user.gameTry?.[0];

    await createSession(
      user.id.toString(),
      user.email,
      gameTry?.FinishedAt?.toISOString() || "",
      user.inscription_date.toISOString(),
      gameTry?.FirstLevelStars || 0,
      gameTry?.SecondLevelStars || 0,
      gameTry?.ThirdLevelStars || 0,
      gameTry?.FourthLevelStars || 0
    );

    // L'utilisateur est nouveau.
    return NextResponse.json(
      { message: "Registration successful" },
      { status: 201 }
    );
  } catch (error) {
    console.log("ERROR:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ message: "Method not allowed" }, { status: 405 });
}
