-- Schema pour la base de données Onedesk

-- Désactiver temporairement les contraintes de clé étrangère
SET FOREIGN_KEY_CHECKS = 0;

-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) DEFAULT NULL,
  avatar VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table des workspaces (équipes)
CREATE TABLE IF NOT EXISTS workspaces (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  letter CHAR(1) NOT NULL,
  color VARCHAR(50) NOT NULL,
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id),
  INDEX idx_workspace_created_by (created_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table des invitations
CREATE TABLE IF NOT EXISTS workspace_invitations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  token VARCHAR(255) NOT NULL UNIQUE,
  workspace_id INT NOT NULL,
  email VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL 7 DAY),
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
  INDEX idx_invitation_token (token),
  INDEX idx_invitation_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table de relation workspace_members (membres des équipes)
CREATE TABLE IF NOT EXISTS workspace_members (
  workspace_id INT NOT NULL,
  user_id INT NOT NULL,
  role ENUM('admin', 'member') NOT NULL DEFAULT 'member',
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (workspace_id, user_id),
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_member_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table des channels (espaces de travail)
CREATE TABLE IF NOT EXISTS channels (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) DEFAULT 'file',
  emoji VARCHAR(10) DEFAULT NULL,
  workspace_id INT NOT NULL,
  position INT NOT NULL DEFAULT 0,
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id),
  INDEX idx_channel_workspace (workspace_id),
  INDEX idx_channel_position (position)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Créer un utilisateur temporaire pour les données de test
-- Cet utilisateur sera remplacé ou lié à l'utilisateur réel après authentification
INSERT IGNORE INTO users (id, name, email) VALUES
(1, 'Utilisateur Temp', 'temp@etu-webschoolfactory.fr');

-- Données de test pour les workspaces
INSERT INTO workspaces (name, letter, color, created_by) VALUES
('WSF Groupe', 'W', 'from-blue-500 to-blue-600', 1),
('Students Hub', 'S', 'from-purple-500 to-purple-600', 1),
('Projets 2025', 'P', 'from-green-500 to-green-600', 1);

-- Définir l'utilisateur comme admin de ses workspaces
INSERT INTO workspace_members (workspace_id, user_id, role) VALUES
(1, 1, 'admin'),
(2, 1, 'admin'),
(3, 1, 'admin');

-- Ajouter des channels de test
INSERT INTO channels (name, type, emoji, workspace_id, position, created_by) VALUES
('Stratégie marketing', 'file', NULL, 1, 1, 1),
('Campagnes', 'file', NULL, 1, 2, 1),
('Réseaux sociaux', 'custom', '🌐', 1, 3, 1),
('UI Elements', 'file', NULL, 2, 1, 1),
('Brand Guidelines', 'custom', '🎨', 2, 2, 1),
('Projets Clients', 'file', NULL, 3, 1, 1),
('Planning', 'custom', '🗓️', 3, 2, 1);

-- Réactiver les contraintes
SET FOREIGN_KEY_CHECKS = 1;
