import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { SessionPayload } from "@/Validation/zod";
import { cookies } from "next/headers";

const secretKey = process.env.SESSION_SECRET;
const encodedKey = new TextEncoder().encode(secretKey);

export async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encodedKey);
}

export async function decrypt(session: string | undefined = "") {
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ["HS256"],
    });
    return payload;
  } catch (error) {
    console.log("Failed to verify session");
  }
}

export async function createSession(
  userId: string,
  email: string,
  finisdhedAt: string,
  createdAt: string,
  firstLevelStars?: number,
  secondLevelStars?: number,
  thirdLevelStars?: number,
  fourthLevelStars?: number
) {
  const expiresAt = new Date("9999-12-31");
  const session = await encrypt({
    userId,
    email,
    finisdhedAt,
    createdAt,
    firstLevelStars,
    secondLevelStars,
    thirdLevelStars,
    fourthLevelStars,
    expiresAt,
  });
  const cookieStore = await cookies();

  cookieStore.set("session", session, {
    httpOnly: true,
    secure: true,
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });
}
