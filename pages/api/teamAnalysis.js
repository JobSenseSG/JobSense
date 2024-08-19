import OpenAI from "openai";

const apiKey = process.env.UPSTAGE_API_KEY;
const openai = new OpenAI({
  apiKey: apiKey,
  baseURL: "https://api.upstage.ai/v1/solar",
});

export default async function handler(req, res) {
  if (req.method === "POST") {
    const {
      companyName,
      teamSize,
      fundingStage,
      industryFocus,
      objectives,
      resumes,
    } = req.body;

    const prompt = `
      Analyze the following company data and provide a team analysis report.
      Company Name: ${companyName}
      Team Size: ${teamSize}
      Funding Stage: ${fundingStage}
      Industry Focus: ${industryFocus}
      Objectives: ${objectives}
      Resumes: ${resumes.join("\n\n")}
    `;

    try {
      const chatCompletion = await openai.chat.completions.create({
        model: "solar-1-mini-chat",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        stream: false,
      });

      const responseText = chatCompletion.choices[0].message.content.trim();
      res.status(200).json({ analysis: responseText });
    } catch (error) {
      console.error(`ERROR: Can't invoke Upstage AI. Reason: ${error}`);
      res.status(500).json({ message: "Failed to invoke model" });
    }
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}
