import OpenAI from "openai";

const apiKey = "up_nwDMy4WRdzgWukb97wN2yAGcwo33H";
const openai = new OpenAI({
  apiKey: apiKey,
  baseURL: "https://api.upstage.ai/v1/solar",
});

export default async function generateContent(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  if (!req.body.role.skills_required) {
    return res.status(200).json({
      compatibility: 0,
      role: req.body.role,
    });
  }

  const prompt = `Parse and rate the resume on how compatible the candidate is to a role using an algorithm. Do not justify your answers, and do not output text. The algorithm will compute a compatibility score from 1 to 100 based on how many skills required by the role are present in the resume. You must output the compatibility score. The skills required for the role are: ${req.body.role.skills_required.toString()}. The resume is shown below: ${
    req.body.resume
  }`;

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
    const compatibility = parseInt(responseText, 10);

    return res.status(200).json({
      compatibility,
      role: req.body.role,
    });
  } catch (error) {
    console.error(
      `ERROR: Can't invoke Upstage AI model. Reason: ${error.message}`
    );
    return res.status(500).json({ error: "Failed to invoke model" });
  }
}
