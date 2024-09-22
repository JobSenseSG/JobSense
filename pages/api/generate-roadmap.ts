// pages/api/generate-roadmap.ts

import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
    return;
  }

  const { term } = req.body;

  if (!term) {
    res.status(400).json({ error: 'Term is required' });
    return;
  }

  try {
    const response = await fetch('https://api.roadmap.sh/v1-generate-ai-roadmap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ term }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      res.status(response.status).send(errorText);
      return;
    }

    // Set the appropriate content type
    res.setHeader('Content-Type', 'text/plain');

    // Read from the web ReadableStream and write to res
    const reader = response.body?.getReader();

    if (reader) {
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;

        if (value) {
          // Decode the Uint8Array to string
          const chunk = decoder.decode(value);
          // Write the chunk to the response
          res.write(chunk);
        }
      }

      // End the response
      res.end();
    } else {
      res.status(500).send('No response body');
    }
  } catch (error) {
    console.error('Error fetching roadmap data:', error);
    res
      .status(500)
      .json({ error: 'An error occurred while fetching the roadmap data.' });
  }
}
