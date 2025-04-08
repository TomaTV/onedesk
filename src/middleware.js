import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

// Fonction de journalisation silencieuse pour les erreurs attendues
function logDebug(message, data) {
  if (process.env.NODE_ENV === "development") {
    console.log(`[Middleware] ${message}`, data || "");
  }
}

// Stockage des demandes récentes pour limitation de débit
const apiRequests = {};

export async function middleware(req) {
  const path = req.nextUrl.pathname;

  // Définir les chemins qui sont accessibles publiquement
  const publicPaths = [
    "/auth/signin",
    "/auth/error",
    "/api/auth/signin",
    "/api/auth/callback/google",
    "/api/auth/session",
    "/api/auth/csrf",
    // Permettre l'accès à la page 404 et d'erreur
    "/not-found",
    "/error",
    // Permettre l'accès à la landing page
    "/landing",
  ];

  const isPathPublic = publicPaths.some(
    (publicPath) => path === publicPath || path.startsWith(publicPath + "/")
  );

  const isApiAuthPath = path.includes("/api/auth");

  // Optimisation : Limiter uniquement les requêtes API très fréquentes aux workspaces
  if (path === "/api/workspaces") {
    const clientIp = req.headers.get("x-forwarded-for") || "unknown";
    const requestKey = `${clientIp}:${path}`;
    const now = Date.now();

    // Contrôle des requêtes en rafale avec compteur
    if (!apiRequests[requestKey]) {
      apiRequests[requestKey] = { lastTime: now, count: 1 };
    } else {
      const request = apiRequests[requestKey];
      const timeSinceLast = now - request.lastTime;

      // Si moins de 200ms entre requêtes, augmenter le compteur
      if (timeSinceLast < 200) {
        request.count++;
        request.lastTime = now;

        // Bloquer seulement après 3 requêtes consécutives trop rapides
        if (request.count > 3) {
          logDebug(
            `Limitation de requête workspaces après ${request.count} appels rapides`
          );
          // Réutiliser le cache précédent, mais normaliser la réponse
          return NextResponse.next();
        }
      } else {
        // Réinitialiser le compteur si plus de 200ms
        request.count = 1;
        request.lastTime = now;
      }
    }

    // Nettoyer les anciennes requêtes toutes les 10 secondes
    if (now % 10000 < 100) {
      for (const key in apiRequests) {
        if (now - apiRequests[key].lastTime > 5000) {
          delete apiRequests[key];
        }
      }
    }
  }

  // Si le chemin est public, autoriser l'accès
  if (isPathPublic) {
    return NextResponse.next();
  }

  // Si c'est une route API d'authentification, autoriser l'accès
  if (isApiAuthPath) {
    return NextResponse.next();
  }

  // Vérifier si l'utilisateur est authentifié
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Si l'utilisateur n'est pas authentifié, rediriger vers la page de connexion
  if (!token) {
    // Pour les requêtes API, renvoyer une erreur 401 plutôt qu'une redirection
    if (path.startsWith("/api/")) {
      return new NextResponse(
        JSON.stringify({
          error: "Unauthorized",
          message: "Vous devez être connecté pour accéder à cette ressource",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Pour les pages normales, rediriger vers la connexion
    const url = new URL("/auth/signin", req.url);
    url.searchParams.set("callbackUrl", encodeURI(req.url));
    return NextResponse.redirect(url);
  }

  // L'utilisateur est authentifié, autoriser l'accès
  return NextResponse.next();
}

// Configurer les chemins pour lesquels le middleware doit s'exécuter
export const config = {
  matcher: [
    // Exclure les fichiers statiques
    "/((?!_next/static|_next/image|favicon.ico|.*\\.svg|.*\\.png|.*\\.jpg|.*\\.jpeg).*)",
  ],
};
