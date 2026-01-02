const db = require("./db");

async function setup() {
  try {
    await db.query(`CREATE TABLE IF NOT EXISTS owners (
      id BIGINT PRIMARY KEY
    )`);
    await db.query(`CREATE TABLE IF NOT EXISTS warnings (
      chat_id BIGINT,
      user_id BIGINT,
      count INT
    )`);
    console.log("✅ Tables created successfully");
  } catch (e) {
    console.error("❌ Error creating tables:", e);
  } finally {
    process.exit();
  }
}

setup();