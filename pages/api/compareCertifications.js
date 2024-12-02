import OpenAI from 'openai';

const apiKey = 'up_q4SzgaQKW3DyDNb8U7p75W33XsWLd';
const openai = new OpenAI({
  apiKey: apiKey,
  baseURL: 'https://api.upstage.ai/v1/solar',
});

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

  const prompt = `Compare the following two certifications in a table format. Include the following details for each certification: 
- Certification Demand (Low, Medium, High)
- Pay Range
- Top 3 Job Titles

Provide the comparison in a table with headers for each certification.

Certification 1: ${certification1}
Certification 2: ${certification2}`;

  try {
    const chatCompletion = await openai.chat.completions.create({
      model: 'solar-1-mini-chat', // Replace with the appropriate model name if needed
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      // Removed topP and maxTokens since they might not be recognized by the Upstage API
      stream: false,
      temperature: 0.5,
    });

    const responseText = chatCompletion.choices[0].message.content.trim();

    return res.status(200).json({
      comparison: responseText,
    });
  } catch (error) {
    console.error(`ERROR: Can't invoke model. Reason: ${error}`);
    return res.status(500).json({ error: 'Failed to invoke model' });
  }
}
