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
