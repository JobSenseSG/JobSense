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

  const prompt = `
  You are an expert evaluator with the task of analyzing a candidate's resume to determine how well it matches a specific job role based on required skills. Please follow these steps:
  
  1. Review the list of required skills for the job role provided below.
  2. Analyze the candidate's resume and identify exact matches for the required skills. Only count a skill if it is explicitly mentioned or if a directly related skill is mentioned (e.g., count "React.js" if the role requires "JavaScript").
  3. Do not consider unrelated skills. If a required skill is not mentioned, reduce the score accordingly.
  4. Assign a compatibility score between 1 and 100, where:
     - 90-100: All required skills are present or closely related skills are present.
     - 70-89: Most (75-89%) of the required skills are present.
     - 50-69: Some (50-74%) of the required skills are present.
     - 30-49: Few (25-49%) of the required skills are present.
     - 1-29: Very few (less than 25%) or none of the required skills are present.
  5. Output only the compatibility score as a single number without any additional text.
  
  Role Required Skills: ${req.body.role.skills_required.toString()}.
  
  Resume: ${req.body.resume}
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
