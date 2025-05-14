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
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { resumeText } = req.body;

  const prompt = `I want to upskill to get a job in the tech industry. Identify 3 distinct skills that he does not already know and would benefit from learning. Return each skill in the following format:

1. Skill Title 
-----------------------
(Reason for learning the skill roughly 3 sentences long).

2. Skill Title
-----------------------
(Reason for learning the skill roughly 3 sentences long).

3. Skill Title
-----------------------
(Reason for learning the skill roughly 3 sentences long).

Ensure that there is a clear separation between the title and the reason with a line of dashes, and separate each skill entry with two new lines. The skill titles should be single-line and the reasons should be clear and concise. Don't put bracket () between the skill title. Here is his current skillset:

${resumeText}`;

  const command = new InvokeModelWithResponseStreamCommand({
    modelId: 'anthropic.claude-3-sonnet-20240229-v1:0',
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify({
      anthropic_version: 'bedrock-2023-05-31',
      messages: [{ role: 'user', content: prompt }],
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

    console.log('Claude Response:', fullResponse);

    const skills = fullResponse
      .trim()
      .split(/\n\s*\n/)
      .map((skill) => {
        const parts = skill.split(/\n-{2,}\n/);
        if (parts.length === 2) {
          const title = parts[0].trim().replace(/^\d+\.\s*/, ''); // Remove "1. ", "2. ", etc.
          const points = parts[1].trim();
          return { title, points };
        }
        return null;
      })
      .filter((skill) => skill !== null);

    return res.status(200).json(skills);
  } catch (error) {
    console.error(`ERROR: Can't invoke AWS Bedrock Claude 3. Reason:`, error);
    return res.status(500).json({ error: 'Failed to invoke model' });
  }
}
