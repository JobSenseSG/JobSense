import { BedrockRuntimeClient, ConverseCommand, ConversationRole } from "@aws-sdk/client-bedrock-runtime";

// Initialize the BedrockRuntimeClient
const client = new BedrockRuntimeClient({ region: 'us-west-2' });

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { resume } = req.body;

    if (!resume) {
      return res.status(400).json({ message: 'Resume must not be null' });
    }

    const prompt = `Parse and output the candidate's latest role based on their resume and do not justify your answers and do not display the company name. The resume is shown below: ${resume}`;

    const modelId = 'anthropic.claude-3-haiku-20240307-v1:0';
    const conversation = [
      {
        role: ConversationRole.USER,
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
      const responseText = response.output.messages[0].content[0].text.trim();

      return res.status(200).json({ latestRole: responseText });
    } catch (error) {
      console.error(`ERROR: Can't invoke '${modelId}'. Reason: ${error}`);
      return res.status(500).json({ message: 'Failed to invoke model' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
