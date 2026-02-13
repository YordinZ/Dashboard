const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false, // localhost
});

(async () => {
  try {
    const client = await pool.connect();
    console.log("✅ Conectado a PostgreSQL");
    client.release();
  } catch (err) {
    console.error("❌ Error conectando a PostgreSQL (FULL):", err);
  }
})();

module.exports = pool;
