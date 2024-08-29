import { BedrockRuntimeClient, ConverseCommand } from "@aws-sdk/client-bedrock-runtime";

const client = new BedrockRuntimeClient({ region: 'us-west-2' });

export default async function compareCertifications(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const { certification1, certification2 } = req.body;

    if (!certification1 || !certification2) {
        return res.status(400).json({ error: 'Both certifications must be provided' });
    }

    const prompt = `NO MORE THAN 200 WORDS Compare the following two certifications based on industry demand, salary range, and top job titles. Provide a detailed comparison and an overall rating. 
    Certification 1: ${certification1}
    Certification 2: ${certification2}`;

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
        const responseText = response.output.message.content[0].text.trim();

        return res.status(200).json({
            comparison: responseText,
        });
    } catch (error) {
        console.error(`ERROR: Can't invoke '${modelId}'. Reason: ${error}`);
        return res.status(500).json({ error: 'Failed to invoke model' });
    }
}
