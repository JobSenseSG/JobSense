// pages/api/skills-to-learn.js
import AWS from 'aws-sdk';

// Configure the AWS SDK
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID, // Ensure these are set in your environment
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1' // Adjust to your AWS region
});

const bedrock = new AWS.Bedrock();

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { resumeText, previousResponse } = req.body;
    try {
      const prompt = `You are helping a friend upskill himself so that he can get a job in the tech industry. Based on his resume/information below, give 1 skill you would recommend him to learn? 
: ${resumeText} Please return the title of the skill AND give why he should learn it in 100 words. Do NOT recommend the same language in ${previousResponse} please use a DIFFERENT RECOMMENDATION ALL THE TIME`;

      const params = {
        ModelId: 'claude-ai', // Ensure this matches the model ID in AWS Bedrock
        Prompt: prompt,
        MaxTokens: 150 // Adjust based on your needs
      };

      const result = await bedrock.invokeModel(params).promise();
      const text = result.Output;

      return res.status(200).send(text); // Send the response as plain text
    } catch (error) {
      console.error("Error generating content:", error);
      res.status(500).json({ error: "Failed to generate content" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
