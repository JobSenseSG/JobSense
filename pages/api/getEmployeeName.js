import {
  BedrockRuntimeClient,
  InvokeModelWithResponseStreamCommand,
} from '@aws-sdk/client-bedrock-runtime';

const bedrockClient = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || 'us-east-1',
});

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

  const command = new InvokeModelWithResponseStreamCommand({
    modelId: 'anthropic.claude-3-sonnet-20240229-v1:0',
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify({
      anthropic_version: 'bedrock-2023-05-31',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 100,
      temperature: 0.3,
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

    const employeeName = fullResponse.trim();

    return res.status(200).json({ employeeName });
  } catch (error) {
    console.error(`ERROR: Can't invoke AWS Bedrock Claude 3. Reason:`, error);
    return res.status(500).json({ message: 'Failed to invoke model' });
  }
}
