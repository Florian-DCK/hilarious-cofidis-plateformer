import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/session";

export async function GET() {
  try {
    const cookie = (await cookies()).get("session")?.value;
    const session = await decrypt(cookie);

    return NextResponse.json({
      hasSession: !!session,
      session: session || null,
      cookieExists: !!cookie,
    });
  } catch (error) {
    return NextResponse.json({
      error: "Failed to decode session",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
