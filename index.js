const express = require("express");
const { Pool } = require("pg");

const app = express();
app.use(express.json());

// Connect to PostgreSQL using Railway variable
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false   // because your DB is on a local VM
});

// Test route
app.get("/", (req, res) => {
  res.send("API + Database connected");
});

// ENERGY DATA ENDPOINT
app.post("/energy", async (req, res) => {
  try {
    const {
      datum,
      n,
      elektriciteit,
      beginstand,
      eindstand,
      kosten,
      kwh
    } = req.body;

    // Insert into database
    const query = `
      INSERT INTO energy_data
      (datum, n, elektriciteit, beginstand, eindstand, kosten, kwh)
      VALUES ($1,$2,$3,$4,$5,$6,$7)
    `;

    const values = [datum, n, elektriciteit, beginstand, eindstand, kosten, kwh];

    await pool.query(query, values);

    res.json({ ok: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database insert failed" });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
