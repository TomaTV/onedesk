import mysql from "serverless-mysql";

const db = mysql({
  config: {
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    database: process.env.MYSQL_DATABASE,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    charset: "utf8mb4",
  },
});

/**
 * Exécute une requête SQL avec gestion des erreurs améliorée
 * @param {Object} options - Options de la requête
 * @param {string} options.query - Requête SQL
 * @param {Array} options.values - Valeurs à insérer dans la requête
 * @param {boolean} options.keepConnectionOpen - Si true, ne ferme pas la connexion après la requête
 * @returns {Promise<any>} Résultat de la requête
 */
export async function executeQuery({ query, values = [], keepConnectionOpen = false }) {
  try {
    const results = await db.query(query, values);
    
    // Fermer la connexion seulement si keepConnectionOpen est false
    if (!keepConnectionOpen) {
      await db.end();
    }
    
    return results;
  } catch (error) {
    console.error("Database query error:", error);
    // Ajout d'informations détaillées sur l'erreur
    throw new Error(`Database query failed: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Exécute plusieurs requêtes dans une transaction
 * @param {Array<Function>} operations - Fonctions contenant les opérations à exécuter
 * @param {boolean} keepConnectionOpen - Si true, ne ferme pas la connexion après la transaction
 * @returns {Promise<Array>} Résultats des opérations
 */
export async function executeTransaction(operations, keepConnectionOpen = false) {
  try {
    await db.query('START TRANSACTION');
    
    const results = [];
    for (let i = 0; i < operations.length; i++) {
      // Passer les résultats précédents à chaque opération
      const result = await operations[i](db, results);
      results.push(result);
    }
    
    await db.query('COMMIT');
    
    // Fermer la connexion seulement si keepConnectionOpen est false
    if (!keepConnectionOpen) {
      await db.end();
    }
    
    return results;
  } catch (error) {
    console.error("Transaction error:", error);
    await db.query('ROLLBACK');
    
    // Fermer la connexion même en cas d'erreur, sauf si demandé explicitement de la garder ouverte
    if (!keepConnectionOpen) {
      await db.end();
    }
    
    throw new Error(`Transaction failed: ${error.message || 'Unknown error'}`);
  }
}

export default db;
