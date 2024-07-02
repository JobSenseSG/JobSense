import type { NextApiRequest, NextApiResponse } from 'next'
const pool = require('../../lib/db.js'); // Update the path to where your actual db config file is located

type ResponseData = {
  message: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method == 'POST') {

    if (!req.body.title) {
      res.status(400).json({ message: 'Title must not be null' })
    }

    const client = await pool.connect();

    try {
      // Replace 'your_table' with the actual table name you want to query
      const result = await client.query(`SELECT * FROM public.bigdata_job WHERE title LIKE '${req.body.title}' LIMIT 5`);

      return res.status(200).json(result.rows);
    } catch (error) {
      // It's good to handle errors and send a corresponding response
      return res.status(500).json({ error: error.message });
    } finally {
      client.release();
    }
  } else {
    return res.status(400).json({ message: 'Method not supported ' })
  }
}
