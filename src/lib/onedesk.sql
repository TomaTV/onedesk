-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : dim. 06 avr. 2025 à 22:46
-- Version du serveur : 10.4.32-MariaDB
-- Version de PHP : 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `onedesk`
--

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) DEFAULT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `avatar`, `created_at`, `updated_at`) VALUES
(1, 'Utilisateur Temp', 'temp@etu-webschoolfactory.fr', NULL, NULL, '2025-04-06 20:31:57', '2025-04-06 20:31:57'),
(2, 'Thomas DEVULDER', 't_devulder@etu-webschoolfactory.fr', 'xjatqekwtx', NULL, '2025-04-06 20:33:36', '2025-04-06 20:33:36'),
(3, 'Toma', 'devulder.thomas2005@gmail.com', 'ta68g3ghz8', 'https://lh3.googleusercontent.com/a/ACg8ocLHPUrTpurSrNJ9TBDV5Rc-_E1ea6OqGzAHsqQQZvMye2y_UT3l=s96-c', '2025-04-06 20:37:32', '2025-04-06 20:37:32');

-- --------------------------------------------------------

--
-- Structure de la table `workspaces`
--

CREATE TABLE `workspaces` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `letter` char(1) NOT NULL,
  `color` varchar(50) NOT NULL,
  `created_by` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `workspaces`
--

INSERT INTO `workspaces` (`id`, `name`, `letter`, `color`, `created_by`, `created_at`, `updated_at`) VALUES
(1, 'WSF Groupe', 'W', 'from-blue-500 to-blue-600', 1, '2025-04-06 20:31:57', '2025-04-06 20:31:57'),
(2, 'Students Hub', 'S', 'from-purple-500 to-purple-600', 1, '2025-04-06 20:31:57', '2025-04-06 20:31:57'),
(3, 'Projets 2025', 'P', 'from-green-500 to-green-600', 1, '2025-04-06 20:31:57', '2025-04-06 20:31:57'),
(4, 'TOTO', 'T', 'from-green-500 to-green-600', 2, '2025-04-06 20:33:36', '2025-04-06 20:36:48'),
(6, 'asasd', 'A', 'from-blue-500 to-blue-600', 2, '2025-04-06 20:36:26', '2025-04-06 20:36:26'),
(7, 'Espace de Toma', 'T', 'from-indigo-500 to-indigo-600', 3, '2025-04-06 20:37:32', '2025-04-06 20:37:32');

-- --------------------------------------------------------

--
-- Structure de la table `channels`
--

CREATE TABLE `channels` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `type` ENUM('discussion', 'tableau', 'projet') DEFAULT 'discussion',
  `emoji` varchar(10) DEFAULT NULL,
  `workspace_id` int(11) NOT NULL,
  `position` int(11) NOT NULL DEFAULT 0,
  `created_by` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `channels`
--

INSERT INTO `channels` (`id`, `name`, `type`, `emoji`, `workspace_id`, `position`, `created_by`, `created_at`, `updated_at`) VALUES
(1, 'Stratégie marketing', 'discussion', NULL, 1, 1, 1, '2025-04-06 20:31:57', '2025-04-06 20:31:57'),
(2, 'Campagnes', 'projet', NULL, 1, 2, 1, '2025-04-06 20:31:57', '2025-04-06 20:31:57'),
(3, 'Réseaux sociaux', 'discussion', '🌐', 1, 3, 1, '2025-04-06 20:31:57', '2025-04-06 20:31:57'),
(4, 'UI Elements', 'tableau', NULL, 2, 1, 1, '2025-04-06 20:31:57', '2025-04-06 20:31:57'),
(5, 'Brand Guidelines', 'discussion', '🎨', 2, 2, 1, '2025-04-06 20:31:57', '2025-04-06 20:31:57'),
(6, 'Projets Clients', 'projet', NULL, 3, 1, 1, '2025-04-06 20:31:57', '2025-04-06 20:31:57'),
(7, 'Planning', 'tableau', '🗓️', 3, 2, 1, '2025-04-06 20:31:57', '2025-04-06 20:31:57'),
(8, 'Bienvenue', 'discussion', '👋', 4, 1, 2, '2025-04-06 20:33:36', '2025-04-06 20:33:36'),
(9, 'Notes', 'tableau', NULL, 4, 2, 2, '2025-04-06 20:33:36', '2025-04-06 20:33:36'),
(12, 'Général', 'discussion', '👋', 6, 1, 2, '2025-04-06 20:36:26', '2025-04-06 20:36:26'),
(13, 'Documents', 'tableau', NULL, 6, 2, 2, '2025-04-06 20:36:26', '2025-04-06 20:36:26'),
(14, 'Bienvenue', 'discussion', '👋', 7, 1, 3, '2025-04-06 20:37:32', '2025-04-06 20:37:32'),
(15, 'Notes', 'tableau', NULL, 7, 2, 3, '2025-04-06 20:37:32', '2025-04-06 20:37:32'),
(16, 'OUAIS OUAIS', 'projet', NULL, 4, 3, 3, '2025-04-06 20:40:59', '2025-04-06 20:40:59');

-- --------------------------------------------------------

--
-- Structure de la table `messages`
--

CREATE TABLE `messages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `channel_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `content` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `channel_id` (`channel_id`),
  KEY `user_id` (`user_id`),
  KEY `idx_messages_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `messages`
--

INSERT INTO `messages` (`id`, `channel_id`, `user_id`, `content`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 'Bienvenue dans le canal de stratégie marketing !', '2025-04-06 20:32:10', '2025-04-06 20:32:10'),
(2, 1, 2, 'Merci pour l\'invitation, je suis ravi de rejoindre cette équipe.', '2025-04-06 20:33:50', '2025-04-06 20:33:50'),
(3, 3, 1, 'Ce canal est dédié à la stratégie sur les réseaux sociaux.', '2025-04-06 20:34:15', '2025-04-06 20:34:15'),
(4, 3, 3, 'Super initiative, j\'ai hâte de commencer à travailler sur ce projet.', '2025-04-06 20:38:05', '2025-04-06 20:38:05'),
(5, 5, 1, 'Bienvenue dans le canal des directives de marque. Veuillez partager vos idées ici.', '2025-04-06 20:35:22', '2025-04-06 20:35:22'),
(6, 8, 2, 'Bonjour à tous ! Bienvenue dans cet espace de travail.', '2025-04-06 20:34:00', '2025-04-06 20:34:00'),
(7, 8, 3, 'Merci pour l\'invitation, c\'est un plaisir de participer.', '2025-04-06 20:41:10', '2025-04-06 20:41:10'),
(8, 12, 2, 'Premier message dans ce workspace !', '2025-04-06 20:36:40', '2025-04-06 20:36:40'),
(9, 14, 3, 'Bienvenue dans mon nouvel espace de travail !', '2025-04-06 20:37:45', '2025-04-06 20:37:45');

-- --------------------------------------------------------

--
-- Structure de la table `workspace_members`
--

CREATE TABLE `workspace_members` (
  `workspace_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `role` enum('admin','member') NOT NULL DEFAULT 'member',
  `joined_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`workspace_id`,`user_id`),
  KEY `idx_member_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `workspace_members`
--

INSERT INTO `workspace_members` (`workspace_id`, `user_id`, `role`, `joined_at`) VALUES
(1, 1, 'admin', '2025-04-06 20:31:57'),
(2, 1, 'admin', '2025-04-06 20:31:57'),
(3, 1, 'admin', '2025-04-06 20:31:57'),
(4, 2, 'admin', '2025-04-06 20:33:36'),
(4, 3, 'member', '2025-04-06 20:40:45'),
(6, 2, 'admin', '2025-04-06 20:36:26'),
(7, 3, 'admin', '2025-04-06 20:37:32');

-- --------------------------------------------------------

--
-- Structure de la table `workspace_invitations`
--

CREATE TABLE `workspace_invitations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `token` varchar(255) NOT NULL,
  `workspace_id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `expires_at` timestamp NOT NULL DEFAULT (current_timestamp() + interval 7 day),
  PRIMARY KEY (`id`),
  UNIQUE KEY `token` (`token`),
  KEY `workspace_id` (`workspace_id`),
  KEY `idx_invitation_token` (`token`),
  KEY `idx_invitation_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Index pour les tables déchargées
--

ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_user_email` (`email`);

ALTER TABLE `workspaces`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_workspace_created_by` (`created_by`);

ALTER TABLE `channels`
  ADD PRIMARY KEY (`id`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `idx_channel_workspace` (`workspace_id`),
  ADD KEY `idx_channel_position` (`position`);

-- --------------------------------------------------------

--
-- AUTO_INCREMENT pour les tables déchargées
--

ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

ALTER TABLE `workspaces`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

ALTER TABLE `channels`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

ALTER TABLE `messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

ALTER TABLE `workspace_invitations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

-- --------------------------------------------------------

--
-- Contraintes pour les tables déchargées
--

ALTER TABLE `workspaces`
  ADD CONSTRAINT `workspaces_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`);

ALTER TABLE `channels`
  ADD CONSTRAINT `channels_ibfk_1` FOREIGN KEY (`workspace_id`) REFERENCES `workspaces` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `channels_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`);

ALTER TABLE `messages`
  ADD CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`channel_id`) REFERENCES `channels` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

ALTER TABLE `workspace_members`
  ADD CONSTRAINT `workspace_members_ibfk_1` FOREIGN KEY (`workspace_id`) REFERENCES `workspaces` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `workspace_members_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

ALTER TABLE `workspace_invitations`
  ADD CONSTRAINT `workspace_invitations_ibfk_1` FOREIGN KEY (`workspace_id`) REFERENCES `workspaces` (`id`) ON DELETE CASCADE;

COMMIT;