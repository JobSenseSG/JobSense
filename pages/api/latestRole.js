import OpenAI from "openai";

const apiKey = "up_nwDMy4WRdzgWukb97wN2yAGcwo33H";
const openai = new OpenAI({
  apiKey: apiKey,
  baseURL: "https://api.upstage.ai/v1/solar",
});

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { resume } = req.body;

    if (!resume) {
      return res.status(400).json({ message: "Resume must not be null" });
    }

    const prompt = `Parse and output the candidate's latest role based on their resume and do not justify your answers and do not display the company name. The resume is shown below: ${resume}`;

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

      return res.status(200).json({ latestRole: responseText });
    } catch (error) {
      console.error(`ERROR: Can't invoke Upstage AI. Reason: ${error}`);
      return res.status(500).json({ message: "Failed to invoke model" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).json({ message: "Method Not Allowed" });
  }
}
