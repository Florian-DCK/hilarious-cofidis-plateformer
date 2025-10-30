import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/lib/session";
import { cookies } from "next/headers";

// Adjust the proxy logic to handle the specified redirection rules

export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const cookie = (await cookies()).get("session")?.value;
  const session = await decrypt(cookie);

  // Redirect to /register if the user is not authenticated and accessing /game, /game/*, or /thanks
  if (
    (path === "/game" || path.startsWith("/game/") || path === "/thanks") &&
    !session?.userId
  ) {
    return NextResponse.redirect(new URL("/register", req.nextUrl));
  }

  // Debug: Log session info for /thanks access
  if (path === "/thanks") {
    console.log("DEBUG /thanks access:", {
      hasUserId: !!session?.userId,
      finisdhedAt: session?.finisdhedAt,
      finisdhedAtType: typeof session?.finisdhedAt,
      finished: !(!session?.finisdhedAt || session?.finisdhedAt === ""),
    });
  }

  // Redirect to /game if the user is authenticated, on /thanks, and has not finished the game
  if (
    path === "/thanks" &&
    session?.userId &&
    (!session?.finisdhedAt || session?.finisdhedAt === "")
  ) {
    console.log("DEBUG: Redirecting to /game - user has not finished");
    return NextResponse.redirect(new URL("/game", req.nextUrl));
  }

  // Redirect to /thanks if the user is authenticated, on /game or /game/*, has finished the game AND has filled subsidary
  if (
    (path === "/game" || path.startsWith("/game/")) &&
    session?.finisdhedAt &&
    session?.finisdhedAt !== "" &&
    session?.subsidary
  ) {
    return NextResponse.redirect(new URL("/thanks", req.nextUrl));
  }

  return NextResponse.next();
}

// Routes Proxy should not run on
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
