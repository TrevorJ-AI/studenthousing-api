const express = require("express");
const { Pool } = require("pg");

const app = express();
app.use(express.json());

// ✅ Connect to PostgreSQL (Railway)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false
});

// ✅ AUTO-CREATE TABLE (runs on startup)
pool.query(`
  CREATE TABLE IF NOT EXISTS sensor_data (
    id SERIAL PRIMARY KEY,
    sensor VARCHAR(50),
    value INTEGER,
    timestamp BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`).then(() => {
  console.log("sensor_data table is ready");
}).catch(err => {
  console.error("Table creation failed:", err);
});

// ✅ TEST ROUTE
app.get("/", (req, res) => {
  res.send("Studenthousing API is running");
});

// ✅ ARDUINO MOTION SENSOR ENDPOINT
app.post("/api/receive-data", async (req, res) => {
  try {
    const { sensor, value, timestamp } = req.body;

    if (!sensor || value === undefined || !timestamp) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const query = `
      INSERT INTO sensor_data (sensor, value, timestamp)
      VALUES ($1, $2, $3)
    `;

    const values = [sensor, value, timestamp];
    await pool.query(query, values);

    res.json({ ok: true });

  } catch (err) {
    console.error("Insert error:", err);
    res.status(500).json({ error: "Database insert failed" });
  }
});

// ✅ START SERVER
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
