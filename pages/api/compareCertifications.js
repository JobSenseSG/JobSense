// Using external mlvoca free LLM API (DeepSeek)

export default async function compareCertifications(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { certification1, certification2 } = req.body;

  if (!certification1 || !certification2) {
    return res
      .status(400)
      .json({ error: 'Both certifications must be provided' });
  }

  // Use mlvoca free LLM API with DeepSeek R1 (non-streaming)
  const prompt = `Compare the following two certifications in a table format. Include the following:
- Certification Demand (Low, Medium, High)
- Pay Range
- Top 3 Job Titles

Certification 1: ${certification1}
Certification 2: ${certification2}`;

  try {
    const apiResp = await fetch('https://mlvoca.com/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'deepseek-r1:1.5b',
        prompt,
        stream: false,
        options: { temperature: 0.5, max_tokens: 1000 },
      }),
    });

    if (!apiResp.ok) {
      const txt = await apiResp.text();
      console.error('mlvoca error', apiResp.status, txt);
      return res.status(502).json({ error: 'LLM provider error' });
    }

    const payload = await apiResp.json();
    const fullResponse = (payload && payload.response) || '';

    return res.status(200).json({
      comparison: fullResponse.trim().replace(/<br\s*\/?>/gi, ' '),
    });
  } catch (error) {
    console.error('Error invoking mlvoca DeepSeek:', error);
    return res.status(500).json({ error: 'Failed to invoke model' });
  }
}
