import { NextResponse } from "next/server";

import { PrismaClient } from "../../../generated/prisma/client";
import { User as UserSchema } from "../../../Validation/zod";
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
    });

    if (existingUser) {
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
        return NextResponse.json(
          { message: "User data does not match existing record" },
          { status: 409 }
        );
      } else if (existingUser.subsidary === null) {
        return NextResponse.json(
          { message: "User exists but subsidary is null" },
          { status: 422 }
        );
      } else {
        return NextResponse.json(
          { message: "User already registered and subsidary is not null" },
          { status: 200 }
        );
      }
    }

    // Création de l'utilisateur dans la BDD si il n'existe pas déjà
    await prisma.user.create({
      data: {
        name: data.name,
        surname: data.surname,
        gender: data.civility === "madame" ? "FEMALE" : "MALE",
        email: data.email,
        // Parsing manuel du format 'JJ / MM / AAAA'
        birthdate: (() => {
          const [day, month, year] = data.birthdate
            .split(/[\/\-]/)
            .map((v: string) => Number(v.trim()));
          return new Date(Date.UTC(year, month - 1, day));
        })(),
      },
    });

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
