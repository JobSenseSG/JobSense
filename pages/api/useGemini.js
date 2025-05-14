import {
  BedrockRuntimeClient,
  InvokeModelWithResponseStreamCommand,
} from '@aws-sdk/client-bedrock-runtime';

const bedrockClient = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || 'us-east-1',
});

export default async function generateContent(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { role, resume } = req.body;

  if (!role?.skills_required) {
    return res.status(200).json({
      compatibility: 0,
      role,
    });
  }

  const prompt = `
You are an expert evaluator with the task of analyzing a candidate's resume to determine how well it matches a specific job role based on required skills. Please follow these steps:

1. Review the list of required skills for the job role provided below.
2. Analyze the candidate's resume and identify exact matches for the required skills. Only count a skill if it is explicitly mentioned or if a directly related skill is mentioned (e.g., count "React.js" if the role requires "JavaScript").
3. Do not consider unrelated skills. If a required skill is not mentioned, reduce the score accordingly.
4. Assign a compatibility score between 1 and 100, where:
   - 90-100: All required skills are present or closely related skills are present.
   - 70-89: Most (75-89%) of the required skills are present.
   - 50-69: Some (50-74%) of the required skills are present.
   - 30-49: Few (25-49%) of the required skills are present.
   - 1-29: Very few (less than 25%) or none of the required skills are present.
5. Output only the compatibility score as a single number without any additional text.

Role Required Skills: ${role.skills_required.toString()}.

Resume: ${resume}
`;

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

    const trimmed = fullResponse.trim();
    const compatibility = parseInt(trimmed.match(/\d+/)?.[0] || '0', 10);

    return res.status(200).json({
      compatibility,
      role,
    });
  } catch (error) {
    console.error(
      `ERROR: Can't invoke AWS Claude 3 model. Reason: ${error.message}`
    );
    return res.status(500).json({ error: 'Failed to invoke model' });
  }
}
