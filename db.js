const { Client } = require("pg");

// URL from Replit Secrets
const connectionString = process.env.NEON_URL;

// Create client
const client = new Client({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

// Connect
client.connect()
  .then(() => console.log("✅ Connected to Neon"))
  .catch(err => console.error("❌ Neon connection error:", err));

module.exports = client;