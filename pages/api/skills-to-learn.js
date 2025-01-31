import OpenAI from 'openai';

const apiKey = 'up_q4SzgaQKW3DyDNb8U7p75W33XsWLd';
const openai = new OpenAI({
  apiKey: apiKey,
  baseURL: 'https://api.upstage.ai/v1/solar',
});

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { resumeText } = req.body;
    const prompt = `I want to upskill to get a job in the tech industry. Identify 3 distinct skills that he does not already know and would benefit from learning. Return each skill in the following format:

1. (skill title) 
-----------------------
(Reason for learning the skill roughly 3 sentences long).

2. (Skill Title)
-----------------------
(Reason for learning the skill roughly 3 sentences long).

3. (Skill Title)
-----------------------
(Reason for learning the skill roughly 3 sentences long).

Ensure that there is a clear separation between the title and the reason with a line of dashes, and separate each skill entry with two new lines. The skill titles should be single-line and the reasons should be clear and concise. Don't put bracket () between the skill title. Here is his current skillset:\n\n${resumeText}`;

    try {
      const chatCompletion = await openai.chat.completions.create({
        model: 'solar-1-mini-chat',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        stream: false,
      });

      // Extract and return the response text.
      const responseText = chatCompletion.choices[0].message.content.trim();
      console.log('AI Response:', responseText);

      // Process the response to handle varying lengths of separators
      const skills = responseText
        .split(/\n\s*\n/)
        .map((skill) => {
          // Use a regex to match the separator and split accordingly
          const parts = skill.split(/\n-{2,}\n/);
          if (parts.length === 2) {
            const title = parts[0].trim();
            const points = parts[1].trim();
            return { title, points };
          }
          return null;
        })
        .filter((skill) => skill !== null);

      res.status(200).json(skills);
    } catch (error) {
      console.error(`ERROR: Can't invoke Upstage AI. Reason: ${error}`);
      res.status(500).json({ error: 'Failed to invoke model' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
