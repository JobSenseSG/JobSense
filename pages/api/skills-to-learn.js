import {
  BedrockRuntimeClient,
  ConverseCommand,
} from "@aws-sdk/client-bedrock-runtime";

const client = new BedrockRuntimeClient({ region: 'us-west-2' });

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { resumeText, previousResponse } = req.body;
    const prompt = `You are helping a friend upskill himself so that he can get a job in the tech industry. Identify 1 skill you would recommend him to learn that he doesnt already know to better his skillset: ${resumeText}. Please return the title of the skill Do NOT recommend the same language in ${previousResponse}; please use a DIFFERENT RECOMMENDATION ALL THE TIME. Please return the title of the skill ONLY and no other unecessary words. Below the title(GO TO THE NEXT LINE) i would like you to return reasonings for why he should learn the skill you have identified.`;

    const modelId = 'anthropic.claude-3-haiku-20240307-v1:0';
    const conversation = [
      {
        role: "user",
        content: [{ text: prompt }],
      },
    ];

    const command = new ConverseCommand({
      modelId,
      messages: conversation,
      inferenceConfig: { maxTokens: 512, temperature: 0.5, topP: 0.9 },
    });

    try {
      const response = await client.send(command);

      // Extract and print the response text.
      const responseText = response.output.message.content[0].text;
      res.status(200).json(responseText);
    } catch (error) {
      console.error(`ERROR: Can't invoke '${modelId}'. Reason: ${error}`);
      res.status(500).json({ error: 'Failed to invoke model' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
