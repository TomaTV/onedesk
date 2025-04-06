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
          hd: "etu-webschoolfactory.fr" // Restreint aux utilisateurs de ce domaine
        }
      }
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Vérifier que l'email se termine par @etu-webschoolfactory.fr
      if (!user.email.endsWith("@etu-webschoolfactory.fr")) {
        return false; // Refuser la connexion
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
            avatar: user.image
          });
          
          // Créer un workspace par défaut pour le nouvel utilisateur
          if (dbUser) {
            // Déterminer la première lettre pour le workspace
            const firstLetter = user.name.charAt(0).toUpperCase();
            
            // Créer le workspace
            const workspace = await createWorkspace({
              name: `Espace de ${user.name.split(' ')[0]}`,
              letter: firstLetter,
              color: "from-indigo-500 to-indigo-600", // Couleur par défaut
            }, dbUser.id);
            
            if (workspace) {
              // Ajouter l'utilisateur comme admin du workspace (déjà géré par createWorkspace)
              
              // Créer un channel de bienvenue
              await createChannel({
                name: "Bienvenue",
                type: "custom",
                emoji: "👋", // 👋 = emoji main qui salue
                workspaceId: workspace.id,
                createdBy: dbUser.id
              });
              
              // Créer un channel pour les notes
              await createChannel({
                name: "Notes",
                type: "file",
                workspaceId: workspace.id,
                createdBy: dbUser.id
              });
            }
          }
        } else {
          // L'utilisateur existe déjà, vérifier s'il a des workspaces
          const workspaces = await getUserWorkspaces(dbUser.id);
          
          // Si l'utilisateur n'a pas de workspace, en créer un par défaut
          if (workspaces.length === 0) {
            // Déterminer la première lettre pour le workspace
            const firstLetter = user.name.charAt(0).toUpperCase();
            
            // Créer le workspace
            const workspace = await createWorkspace({
              name: `Espace de ${user.name.split(' ')[0]}`,
              letter: firstLetter,
              color: "from-indigo-500 to-indigo-600", // Couleur par défaut
            }, dbUser.id);
            
            if (workspace) {
              // Créer un channel de bienvenue
              await createChannel({
                name: "Bienvenue",
                type: "custom",
                emoji: "👋", // 👋 = emoji main qui salue
                workspaceId: workspace.id,
                createdBy: dbUser.id
              });
              
              // Créer un channel pour les notes
              await createChannel({
                name: "Notes",
                type: "file",
                workspaceId: workspace.id,
                createdBy: dbUser.id
              });
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
    signIn: '/auth/signin', // Page de connexion personnalisée
    error: '/auth/error', // Page d'erreur personnalisée
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
