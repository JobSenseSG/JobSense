import { BedrockRuntimeClient, ConverseCommand } from "@aws-sdk/client-bedrock-runtime";

const client = new BedrockRuntimeClient({ region: 'us-west-2' });

export default async function generateContent(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    if (!req.body.role.skills_required) {
        return res.status(200).json({
            compatibility: 0,
            role: req.body.role,
        });
    }

    const prompt = `Parse and rate the resume on how compatible is the candidate to a role using an algorithm and do not justify your answers and do not output text. The algorithm will compute a compatibility score from 1 to 100 based on how many skills required by the role is present in the resume. You must output the compatibility score. The skills required for the role is ${req.body.role.skills_required.toString()}. The resume is shown below: ${req.body.resume}`;

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

        // Extract the response text, which should be the compatibility score.
        const responseText = response.output.message.content[0].text.trim();

        return res.status(200).json({
            compatibility: parseInt(responseText, 10),
            role: req.body.role,
        });
    } catch (error) {
        console.error(`ERROR: Can't invoke '${modelId}'. Reason: ${error}`);
        return res.status(500).json({ error: 'Failed to invoke model' });
    }
}
