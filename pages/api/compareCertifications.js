import {
  BedrockRuntimeClient,
  InvokeModelWithResponseStreamCommand,
} from '@aws-sdk/client-bedrock-runtime';

const bedrockClient = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || 'us-east-1',
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

  const modelId = 'anthropic.claude-3-sonnet-20240229-v1:0';
  const messages = [
    {
      role: 'user',
      content: `Compare the following two certifications in a table format. Include the following:
- Certification Demand (Low, Medium, High)
- Pay Range
- Top 3 Job Titles

Certification 1: ${certification1}
Certification 2: ${certification2}`,
    },
  ];

  const command = new InvokeModelWithResponseStreamCommand({
    modelId,
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify({
      messages,
      anthropic_version: 'bedrock-2023-05-31', // required
      max_tokens: 1000,
      temperature: 0.5,
    }),
  });

  try {
    const response = await bedrockClient.send(command);

    let fullResponse = '';

    for await (const chunk of response.body) {
      const text = new TextDecoder().decode(chunk.chunk?.bytes);
      if (text) {
        const parsed = JSON.parse(text);
        fullResponse += parsed.delta?.text || '';
      }
    }

    return res.status(200).json({
      comparison: fullResponse.trim().replace(/<br\s*\/?>/gi, ' '),
    });
  } catch (error) {
    console.error('🔥 Full Bedrock Error:', error);
    return res
      .status(500)
      .json({ error: 'Failed to invoke AWS Bedrock model (Claude 3)' });
  }
}
