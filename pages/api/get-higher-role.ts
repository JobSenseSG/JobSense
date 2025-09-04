import { NextApiRequest, NextApiResponse } from 'next';
// Using external mlvoca free LLM API (DeepSeek)

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { resumeText } = req.body;

  if (!resumeText || typeof resumeText !== 'string') {
    return res.status(400).json({ error: 'Resume text is required' });
  }

  const prompt = `Based on the person's current role and experience as described in their resume below, return ONLY the next logical higher role with a maximum of 4 words. Do not include any additional text, explanations, or formatting. Only return the role title.

Here is their current resume:

${resumeText}`;

  try {
    const apiResp = await fetch('https://mlvoca.com/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'deepseek-r1:1.5b',
        prompt,
        stream: false,
        options: { temperature: 0.3, max_tokens: 100 },
      }),
    });

    if (!apiResp.ok) {
      const txt = await apiResp.text();
      console.error('mlvoca error', apiResp.status, txt);
      return res.status(502).json({ error: 'LLM provider error' });
    }

    const payload = await apiResp.json();
    const roleTitle = (payload && payload.response) ? payload.response.trim() : '';

    if (!roleTitle || roleTitle.split(/\s+/).length > 4) {
      return res
        .status(400)
        .json({ error: 'Invalid or overly long role title generated' });
    }

    return res.status(200).json({ roleTitle });
  } catch (error) {
    console.error('Error invoking mlvoca DeepSeek:', error);
    return res.status(500).json({ error: 'Failed to invoke model' });
  }
}
