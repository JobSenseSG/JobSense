// pages/api/events.js
const pool = require('../../lib/db.js'); // Update the path to where your actual db config file is located

export default async function handler(req, res) {
    const client = await pool.connect();
    try {
        // Replace 'your_table' with the actual table name you want to query
        const result = await client.query('SELECT * FROM certificate_evaluations.certificate_info ');
        res.status(200).json(result.rows);
    } catch (error) {
        // It's good to handle errors and send a corresponding response
        res.status(500).json({ error: error.message });
    } finally {
        client.release();
    }
}


