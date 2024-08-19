const pool = require("../../lib/db.js");

export default async function handler(req, res) {
  const client = await pool.connect();
  try {
    const result = await client.query(
      "SELECT * FROM certificate_evaluations.certificate_info "
    );
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
}
