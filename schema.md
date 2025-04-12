# Schéma du projet OneDesk

onedesk/
│
├── public/                      # Fichiers statiques accessibles publiquement
│   ├── 1desk.svg                # Logo vectoriel principal
│   ├── 1desk-title.svg          # Logo avec texte pour l'interface
│   ├── banner.png               # Bannière promotionnelle pour la landing page
│   ├── favicon/                 # Dossier des icônes de favoris
│   │   ├── android-chrome-192x192.png  # Icône pour Android
│   │   ├── android-chrome-512x512.png  # Icône large pour Android
│   │   ├── apple-touch-icon.png        # Icône pour iOS
│   │   ├── favicon-16x16.png           # Favicon petit format
│   │   ├── favicon-32x32.png           # Favicon moyen format
│   │   ├── favicon.ico                 # Favicon standard
│   │   └── site.webmanifest            # Manifeste pour l'installation PWA
│   │
│   ├── favicon.ico              # Favicon racine du site
│   └── Onedesk.png              # Logo principal au format PNG
│
├── src/                         # Code source de l'application
│   │
│   ├── app/                     # Application Next.js (App Router)
│   │   │
│   │   ├── api/                 # Routes API (backend serverless)
│   │   │   │
│   │   │   ├── auth/            # Authentification
│   │   │   │   └── [...nextauth]/ # Route dynamique NextAuth
│   │   │   │       └── route.js   # Configuration OAuth + auto-provisioning
│   │   │   │
│   │   │   ├── channels/        # Gestion des canaux
│   │   │   │   ├── route.js     # Liste des canaux accessibles
│   │   │   │   └── [channelId]/  # Opérations sur canal spécifique
│   │   │   │       ├── messages/ # Gestion des messages
│   │   │   │       │   ├── route.js  # CRUD pour messages
│   │   │   │       │   └── [messageId]/ # Actions sur message individuel
│   │   │   │       │       └── route.js  # Modification/suppression message
│   │   │   │
│   │   │   ├── invitations/     # Système d'invitation
│   │   │   │   ├── accept/      # Acceptation d'invitation
│   │   │   │   │   └── route.js # Logique d'acceptation et ajout au workspace
│   │   │   │   ├── pending/     # Invitations en attente
│   │   │   │   │   └── route.js # Liste des invitations actives
│   │   │   │   ├── validate/    # Validation des tokens
│   │   │   │   │   └── route.js # Vérification de validité d'invitation
│   │   │   │   ├── route.js     # Création de nouvelles invitations
│   │   │   │   └── [token]/     # Gestion d'invitation spécifique
│   │   │   │       └── route.js # Détails d'une invitation
│   │   │   │
│   │   │   ├── socket/          # Communication temps réel
│   │   │   │   ├── io/          # Configuration Socket.IO
│   │   │   │   │   └── route.js # Initialisation du serveur temps réel
│   │   │   │   └── route.js     # Point d'entrée WebSocket
│   │   │   │
│   │   │   ├── socketio.js      # Configuration principale Socket.IO
│   │   │   │
│   │   │   ├── users/           # Gestion des utilisateurs
│   │   │   │   ├── avatar/      # Gestion des photos de profil
│   │   │   │   │   └── route.js # Upload et mise à jour d'avatar
│   │   │   │   └── me/          # Utilisateur courant
│   │   │   │       └── route.js # Profil et préférences utilisateur
│   │   │   │
│   │   │   └── workspaces/      # Gestion des espaces de travail
│   │   │       ├── fix-permissions/ # Réparation des permissions
│   │   │       │   └── route.js  # Correction des rôles utilisateur
│   │   │       ├── id/          # Accès par ID
│   │   │       │   └── [id]/    # Workspace spécifique par ID
│   │   │       │       └── route.js # CRUD par ID numérique
│   │   │       ├── leave/       # Quitter un workspace
│   │   │       │   └── route.js # Logique de départ de workspace
│   │   │       ├── role-check/  # Vérification des droits
│   │   │       │   └── route.js # Validation des permissions
│   │   │       ├── route.js     # Liste et création de workspaces
│   │   │       └── [workspace]/ # Opérations par nom de workspace
│   │   │           ├── channels/   # Canaux dans ce workspace
│   │   │           │   ├── route.js   # Liste et création de canaux
│   │   │           │   └── [channel]/ # Opérations sur canal spécifique
│   │   │           │       └── route.js # CRUD pour un canal
│   │   │           │
│   │   │           ├── invitations/ # Invitations pour ce workspace
│   │   │           │   └── route.js # Gestion des invitations spécifiques
│   │   │           │
│   │   │           ├── members/    # Membres du workspace
│   │   │           │   └── route.js # Ajout/retrait/modification de membres
│   │   │           │
│   │   │           └── route.js    # CRUD pour le workspace lui-même
│   │   │
│   │   ├── auth/                # Pages d'authentification
│   │   │   ├── error/           # Erreurs d'authentification
│   │   │   │   └── page.js      # Page d'erreur personnalisée
│   │   │   └── signin/          # Connexion utilisateur
│   │   │       └── page.js      # Interface de connexion avec Google
│   │   │
│   │   ├── error.js             # Gestion globale des erreurs
│   │   ├── globals.css          # Styles CSS globaux (TailwindCSS)
│   │   ├── layout.js            # Layout racine (AuthProvider, fonts)
│   │   ├── not-found.js         # Page 404 personnalisée
│   │   ├── page.js              # Page d'accueil (redirection vers workspace)
│   │   │
│   │   ├── invite/              # Traitement des invitations
│   │   │   └── [token]/         # Page spécifique à une invitation
│   │   │       └── page.js      # Interface d'acceptation d'invitation
│   │   │
│   │   ├── landing/             # Page de présentation
│   │   │   ├── components/      # Composants spécifiques à la landing
│   │   │   │   ├── Hero.jsx     # Section principale de présentation
│   │   │   │   └── Navbar.jsx   # Barre de navigation de la landing
│   │   │   ├── layout.js        # Layout spécifique à la landing page
│   │   │   └── page.jsx         # Contenu de la page d'accueil
│   │   │
│   │   ├── settings/            # Paramètres utilisateur
│   │   │   └── page.js          # Interface de configuration
│   │   │
│   │   └── [workspace]/         # Pages dynamiques par workspace
│   │       ├── page.js          # Page principale du workspace
│   │       └── [channel]/       # Pages de canal spécifique
│   │           └── page.js      # Affichage d'un canal (chat, tableau, projet)
│   │
│   ├── components/              # Composants React réutilisables
│   │   │
│   │   ├── auth/                # Composants d'authentification
│   │   │   ├── AuthProvider.js  # Provider de session NextAuth
│   │   │   └── PermissionFixer.jsx # Correction auto des permissions
│   │   │
│   │   ├── chat/                # Système de messagerie
│   │   │   ├── ChannelChat.jsx  # Conteneur principal du chat
│   │   │   ├── ChatInput.jsx    # Zone de saisie avec emojis et envoi
│   │   │   └── ChatMessage.jsx  # Affichage d'un message individuel
│   │   │
│   │   ├── modals/              # Fenêtres modales
│   │   │   ├── ChannelModal.jsx # Création/édition de canal
│   │   │   ├── InviteUserModal.jsx # Invitation d'utilisateurs
│   │   │   ├── UserProfileModal.jsx # Profil utilisateur éditable
│   │   │   └── WorkspaceModal.jsx # Création/édition d'espace
│   │   │
│   │   ├── sidebar/             # Navigation latérale
│   │   │   ├── Channel.jsx      # Item individuel de canal
│   │   │   ├── ChannelsList.jsx # Liste organisée des canaux
│   │   │   ├── Sidebar.jsx      # Composant wrapper de la sidebar
│   │   │   ├── SidebarCore.jsx  # Logique et gestion d'état de la sidebar
│   │   │   ├── SidebarHeader.jsx # En-tête avec logo et recherche
│   │   │   ├── UserProfile.jsx  # Profil utilisateur en bas de sidebar
│   │   │   └── WorkspaceSelector.jsx # Menu déroulant de sélection
│   │   │
│   │   ├── workspace/           # Composants liés aux workspaces
│   │   │   └── PendingInvitations.jsx # Liste des invitations en attente
│   │   │
│   │   ├── ErrorBoundary.js     # Capture des erreurs React
│   │   ├── ErrorMessage.jsx     # Affichage stylisé des erreurs
│   │   └── EmojiPicker.jsx      # Sélecteur d'emojis personnalisé
│   │
│   ├── lib/                     # Bibliothèques et logique métier
│   │   │
│   │   ├── hooks/               # Hooks React personnalisés
│   │   │   └── useChat.js       # Hook pour la gestion du chat et messages
│   │   │
│   │   ├── services/            # Services métier
│   │   │   ├── socket/          # Services temps réel
│   │   │   │   └── socket-server.js # Configuration serveur Socket.IO
│   │   │   ├── invitationService.js # Service de gestion des invitations
│   │   │   ├── userService.js   # Service de gestion des utilisateurs
│   │   │   └── workspaceService.js # Service de gestion des workspaces
│   │   │
│   │   ├── utils/               # Utilitaires
│   │   │   ├── socket/          # Utilitaires Socket.IO
│   │   │   │   └── socketClient.js # Client Socket.IO browser
│   │   │   ├── logger.js        # Service de journalisation
│   │   │   └── workspace-utils.js # Fonctions helper pour workspaces
│   │   │
│   │   ├── channels.js          # Couche d'accès aux données des canaux
│   │   ├── db.js                # Configuration MySQL et transaction
│   │   ├── invitations.js       # Couche d'accès aux invitations
│   │   ├── messages.js          # Couche d'accès aux messages
│   │   ├── users.js             # Couche d'accès aux utilisateurs
│   │   ├── workspaces.js        # Couche d'accès aux workspaces
│   │   ├── onedesk.sql          # Script SQL complet (dev et prod)
│   │   └── schema.sql           # Schéma SQL de base (structure)
│   │
│   ├── middleware.js            # Middleware d'authentification et protection
│   └── middleware-socket.js     # Middleware Socket.IO pour temps réel
│
├── .env.example                 # Variables d'environnement (modèle)
├── .env.local                   # Variables d'environnement locales (privées)
├── jsconfig.json                # Alias d'imports et config TypeScript/JS
├── next.config.mjs              # Configuration Next.js (WebSockets, images)
├── package.json                 # Dépendances et scripts
├── postcss.config.mjs           # Configuration PostCSS et TailwindCSS
└── README.md                    # Documentation principale du projet

## Description des composants principaux

### Architecture globale
- **Next.js App Router** : Utilisation de l'architecture moderne de Next.js avec App Router
- **MySQL** : Base de données relationnelle pour stocker les données
- **Next-Auth** : Système d'authentification avec OAuth via Google
- **Socket.IO** : Communication en temps réel pour le chat

### Fonctionnalités principales
1. **Système d'authentification**
   - Connexion via Google
   - Protection des routes par middleware
   - Gestion des sessions

2. **Gestion des Workspaces**
   - Création, modification et suppression d'espaces de travail
   - Système d'invitation par email et par lien
   - Gestion des membres et des rôles (admin, membre)

3. **Channels (Canaux)**
   - Différents types: discussion, tableau, projet
   - Organisation par position
   - Émojis personnalisables

4. **Chat en temps réel**
   - Messages instantanés
   - Modification et suppression des messages
   - Reconnexion automatique

5. **Interface utilisateur**
   - Sidebar de navigation entre workspaces et channels
   - Système de modales pour les interactions
   - Styles adaptés avec TailwindCSS

### Base de données
La structure de la base de données comporte plusieurs tables principales:
- `users` : Stockage des utilisateurs
- `workspaces` : Espaces de travail
- `workspace_members` : Relation entre utilisateurs et workspaces
- `channels` : Canaux de communication
- `workspace_invitations` : Invitations aux workspaces