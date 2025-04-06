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
-- Structure de la table `channels`
--

CREATE TABLE `channels` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `type` varchar(50) DEFAULT 'file',
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
(1, 'Stratégie marketing', 'file', NULL, 1, 1, 1, '2025-04-06 20:31:57', '2025-04-06 20:31:57'),
(2, 'Campagnes', 'file', NULL, 1, 2, 1, '2025-04-06 20:31:57', '2025-04-06 20:31:57'),
(3, 'Réseaux sociaux', 'custom', '🌐', 1, 3, 1, '2025-04-06 20:31:57', '2025-04-06 20:31:57'),
(4, 'UI Elements', 'file', NULL, 2, 1, 1, '2025-04-06 20:31:57', '2025-04-06 20:31:57'),
(5, 'Brand Guidelines', 'custom', '🎨', 2, 2, 1, '2025-04-06 20:31:57', '2025-04-06 20:31:57'),
(6, 'Projets Clients', 'file', NULL, 3, 1, 1, '2025-04-06 20:31:57', '2025-04-06 20:31:57'),
(7, 'Planning', 'custom', '🗓️', 3, 2, 1, '2025-04-06 20:31:57', '2025-04-06 20:31:57'),
(8, 'Bienvenue', 'custom', '👋', 4, 1, 2, '2025-04-06 20:33:36', '2025-04-06 20:33:36'),
(9, 'Notes', 'file', NULL, 4, 2, 2, '2025-04-06 20:33:36', '2025-04-06 20:33:36'),
(12, 'Général', 'custom', '👋', 6, 1, 2, '2025-04-06 20:36:26', '2025-04-06 20:36:26'),
(13, 'Documents', 'file', NULL, 6, 2, 2, '2025-04-06 20:36:26', '2025-04-06 20:36:26'),
(14, 'Bienvenue', 'custom', '👋', 7, 1, 3, '2025-04-06 20:37:32', '2025-04-06 20:37:32'),
(15, 'Notes', 'file', NULL, 7, 2, 3, '2025-04-06 20:37:32', '2025-04-06 20:37:32'),
(16, 'OUAIS OUAIS', 'file', NULL, 4, 3, 3, '2025-04-06 20:40:59', '2025-04-06 20:40:59');

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
-- Structure de la table `workspace_invitations`
--

CREATE TABLE `workspace_invitations` (
  `id` int(11) NOT NULL,
  `token` varchar(255) NOT NULL,
  `workspace_id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `expires_at` timestamp NOT NULL DEFAULT (current_timestamp() + interval 7 day)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `workspace_members`
--

CREATE TABLE `workspace_members` (
  `workspace_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `role` enum('admin','member') NOT NULL DEFAULT 'member',
  `joined_at` timestamp NOT NULL DEFAULT current_timestamp()
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

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `channels`
--
ALTER TABLE `channels`
  ADD PRIMARY KEY (`id`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `idx_channel_workspace` (`workspace_id`),
  ADD KEY `idx_channel_position` (`position`);

--
-- Index pour la table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_user_email` (`email`);

--
-- Index pour la table `workspaces`
--
ALTER TABLE `workspaces`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_workspace_created_by` (`created_by`);

--
-- Index pour la table `workspace_invitations`
--
ALTER TABLE `workspace_invitations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `token` (`token`),
  ADD KEY `workspace_id` (`workspace_id`),
  ADD KEY `idx_invitation_token` (`token`),
  ADD KEY `idx_invitation_email` (`email`);

--
-- Index pour la table `workspace_members`
--
ALTER TABLE `workspace_members`
  ADD PRIMARY KEY (`workspace_id`,`user_id`),
  ADD KEY `idx_member_user` (`user_id`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `channels`
--
ALTER TABLE `channels`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT pour la table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT pour la table `workspaces`
--
ALTER TABLE `workspaces`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT pour la table `workspace_invitations`
--
ALTER TABLE `workspace_invitations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `channels`
--
ALTER TABLE `channels`
  ADD CONSTRAINT `channels_ibfk_1` FOREIGN KEY (`workspace_id`) REFERENCES `workspaces` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `channels_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`);

--
-- Contraintes pour la table `workspaces`
--
ALTER TABLE `workspaces`
  ADD CONSTRAINT `workspaces_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`);

--
-- Contraintes pour la table `workspace_invitations`
--
ALTER TABLE `workspace_invitations`
  ADD CONSTRAINT `workspace_invitations_ibfk_1` FOREIGN KEY (`workspace_id`) REFERENCES `workspaces` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `workspace_members`
--
ALTER TABLE `workspace_members`
  ADD CONSTRAINT `workspace_members_ibfk_1` FOREIGN KEY (`workspace_id`) REFERENCES `workspaces` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `workspace_members_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
