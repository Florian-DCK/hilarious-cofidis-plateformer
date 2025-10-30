import proxy from "./lib/proxy";
import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  // Vérifie si la route existe en utilisant le proxy
  const response = proxy(req);
  if (response) {
    return response;
  }

  // Redirige toutes les pages inexistantes vers "/"
  const path = req.nextUrl.pathname;
  const existingRoutes = [
    "/",
    "/game",
    "/game/*",
    "/thanks",
    "/register",
    "/api/*",
  ]; // Ajoutez ici toutes les routes existantes

  const isExistingRoute = existingRoutes.some((route) => {
    if (route.endsWith("/*")) {
      return path.startsWith(route.replace("/*", ""));
    }
    return path === route;
  });

  if (!isExistingRoute) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\.png$).*)"], // Routes sur lesquelles le middleware s'applique
};
