// Using external mlvoca free LLM API (DeepSeek)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { resume } = req.body;

  if (!resume) {
    return res.status(400).json({ message: 'Resume must not be null' });
  }

  const prompt = `Extract and return only the candidate's full name from the following resume. Do not include any additional text, explanations, or formatting. Only return the name. Resume: ${resume}`;

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
    const employeeName = (payload && payload.response) ? payload.response.trim() : '';

    return res.status(200).json({ employeeName });
  } catch (error) {
    console.error('Error invoking mlvoca DeepSeek:', error);
    return res.status(500).json({ message: 'Failed to invoke model' });
  }
}
