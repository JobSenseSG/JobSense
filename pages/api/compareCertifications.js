import OpenAI from "openai";

const apiKey = "up_nwDMy4WRdzgWukb97wN2yAGcwo33H";
const openai = new OpenAI({
  apiKey: apiKey,
  baseURL: "https://api.upstage.ai/v1/solar",
});

export default async function compareCertifications(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { certification1, certification2 } = req.body;

  if (!certification1 || !certification2) {
    return res
      .status(400)
      .json({ error: "Both certifications must be provided" });
  }

  const prompt = `NO MORE THAN 200 WORDS Compare the following two certifications based on industry demand, salary range, and top job titles. Provide a detailed comparison and an overall rating. 
  Certification 1: ${certification1}
  Certification 2: ${certification2}`;

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

    return res.status(200).json({
      comparison: responseText,
    });
  } catch (error) {
    console.error(`ERROR: Can't invoke Upstage AI. Reason: ${error}`);
    return res.status(500).json({ error: "Failed to invoke model" });
  }
}
