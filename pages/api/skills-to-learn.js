import OpenAI from "openai";

const apiKey = "up_nwDMy4WRdzgWukb97wN2yAGcwo33H";
const openai = new OpenAI({
  apiKey: apiKey,
  baseURL: "https://api.upstage.ai/v1/solar",
});

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { resumeText } = req.body;
    const prompt = `You are helping a friend upskill himself so that he can get a job in the tech industry. Identify 3 distinct skills you would recommend him to learn that he doesn't already know to better his skillset. Please return the title of each skill, followed by a separator (---------------------), and then the reason for learning the skill roughly 3 sentences long. Separate each skill with two newline characters. For the title just use the name of the skill. Here is his current skillset:\n\n${resumeText}`;

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

      // Extract and return the response text.
      const responseText = chatCompletion.choices[0].message.content.trim();
      console.log("AI Response:", responseText);

      // Split the response into individual skills
      const skills = responseText.split("\n\n").map((skill) => {
        const [title, points] = skill
          .split("---------------------")
          .map((part) => part.trim());
        return { title, points };
      });

      res.status(200).json(skills);
    } catch (error) {
      console.error(`ERROR: Can't invoke Upstage AI. Reason: ${error}`);
      res.status(500).json({ error: "Failed to invoke model" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
