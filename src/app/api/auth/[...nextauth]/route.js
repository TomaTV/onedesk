import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { getUserByEmail, createUser } from "@/lib/users";
import { getUserWorkspaces, createWorkspace } from "@/lib/workspaces";
import { createChannel } from "@/lib/channels";
import { addWorkspaceMember } from "@/lib/workspaces";

// Configuration de NextAuth
export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
          response_type: "code",
          include_granted_scopes: "true",
          login_hint: "", // Laisser vide pour éviter que Google présélectionne un compte
          display: "popup",
          // hd: "etu-webschoolfactory.fr", // Restreint aux utilisateurs de ce domaine
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Vérifier que l'email se termine par @etu-webschoolfactory.fr
      if (
        !user.email.endsWith("@etu-webschoolfactory.fr") &&
        user.email !== "devulder.thomas2005@gmail.com"
      ) {
        return false; // Refuser la connexion si l'email n'est ni @etu-webschoolfactory.fr ni devulder.thomas2005@gmail.com
      }

      // Vérifier si l'utilisateur existe déjà dans notre base de données
      try {
        let dbUser = await getUserByEmail(user.email);

        // Si l'utilisateur n'existe pas, le créer
        if (!dbUser) {
          dbUser = await createUser({
            name: user.name,
            email: user.email,
            // Pas besoin de mot de passe pour l'authentification Google
            password: Math.random().toString(36).slice(-10), // Mot de passe aléatoire
            avatar: user.image,
          });

          // Créer un workspace par défaut pour le nouvel utilisateur
          if (dbUser) {
            try {
              // Déterminer la première lettre pour le workspace
              const firstLetter = user.name.charAt(0).toUpperCase();

              // Créer le workspace en gardant la connexion ouverte
              const workspace = await createWorkspace(
                {
                  name: `Espace de ${user.name.split(" ")[0]}`,
                  letter: firstLetter,
                  color: "from-indigo-500 to-indigo-600", // Couleur par défaut
                },
                dbUser.id,
                true // garder la connexion ouverte
              );

              if (workspace) {
                console.log("Workspace créé avec succès, ID:", workspace.id);
                
                // Créer un channel de bienvenue en gardant la connexion ouverte
                const bienvenue = await createChannel({
                  name: "Bienvenue",
                  type: "discussion",
                  emoji: "👋", // 👋 = emoji main qui salue
                  workspaceId: workspace.id,
                  createdBy: dbUser.id,
                  keepConnectionOpen: true
                });
                
                console.log("Channel Bienvenue créé avec succès, ID:", bienvenue?.id);

                // Créer un channel pour les notes
                const notes = await createChannel({
                  name: "Notes",
                  type: "tableau",
                  workspaceId: workspace.id,
                  createdBy: dbUser.id,
                  keepConnectionOpen: false // dernier appel, on peut fermer la connexion
                });
                
                console.log("Channel Notes créé avec succès, ID:", notes?.id);
              }
            } catch (error) {
              console.error("Error creating default workspace and channels:", error);
              // On continue même si la création échoue pour ne pas bloquer la connexion
            }
          }
        } else {
          // L'utilisateur existe déjà, vérifier s'il a des workspaces
          const workspaces = await getUserWorkspaces(dbUser.id);

          // Si l'utilisateur n'a pas de workspace, en créer un par défaut
          if (workspaces.length === 0) {
            try {
              // Déterminer la première lettre pour le workspace
              const firstLetter = user.name.charAt(0).toUpperCase();

              // Créer le workspace (garder la connexion ouverte pour les prochaines requêtes)
              const workspace = await createWorkspace(
                {
                  name: `Espace de ${user.name.split(" ")[0]}`,
                  letter: firstLetter,
                  color: "from-indigo-500 to-indigo-600", // Couleur par défaut
                },
                dbUser.id,
                true // garder la connexion ouverte
              );

              if (workspace) {
                console.log("Workspace créé pour utilisateur existant, ID:", workspace.id);
                
                // Créer un channel de bienvenue
                const bienvenue = await createChannel({
                  name: "Bienvenue",
                  type: "discussion",
                  emoji: "👋", // 👋 = emoji main qui salue
                  workspaceId: workspace.id,
                  createdBy: dbUser.id,
                  keepConnectionOpen: true // garder la connexion ouverte
                });
                
                console.log("Channel Bienvenue créé pour utilisateur existant, ID:", bienvenue?.id);

                // Créer un channel pour les notes
                const notes = await createChannel({
                  name: "Notes",
                  type: "tableau",
                  workspaceId: workspace.id,
                  createdBy: dbUser.id,
                  keepConnectionOpen: false // dernier appel, fermer la connexion
                });
                
                console.log("Channel Notes créé pour utilisateur existant, ID:", notes?.id);
              }
            } catch (error) {
              console.error("Error creating default workspace for existing user:", error);
              // On continue même si la création échoue
            }
          }
        }

        return true; // Autoriser la connexion
      } catch (error) {
        console.error("Error during user verification/creation:", error);
        return false; // Refuser la connexion en cas d'erreur
      }
    },
    async jwt({ token, user, account }) {
      // Si un nouveau login, ajouter l'ID de l'utilisateur au token
      if (account && user) {
        const dbUser = await getUserByEmail(user.email);
        if (dbUser) {
          token.userId = dbUser.id;
        }
      }
      return token;
    },
    async session({ session, token }) {
      // Ajouter l'ID de l'utilisateur à la session
      if (session.user) {
        session.user.id = token.userId;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin", // Page de connexion personnalisée
    error: "/auth/error", // Page d'erreur personnalisée
  },
  session: {
    strategy: "jwt", // Utiliser JWT pour les sessions
    maxAge: 30 * 24 * 60 * 60, // 30 jours
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// Handler NextAuth
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
