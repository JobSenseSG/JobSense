import OpenAI from 'openai';

const apiKey = 'up_nwDMy4WRdzgWukb97wN2yAGcwo33H';
const openai = new OpenAI({
  apiKey: apiKey,
  baseURL: 'https://api.upstage.ai/v1/solar', 
});

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { resume } = req.body;

    if (!resume) {
      return res.status(400).json({ message: 'Resume must not be null' });
    }

    const prompt = `Extract and return only the candidate's full name from the following resume. Do not include any additional text, explanations, or formatting. Only return the name. Resume: ${resume}`;

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

      const responseText = chatCompletion.choices[0].message.content.trim();

      return res.status(200).json({ employeeName: responseText });
    } catch (error) {
      console.error(`ERROR: Can't invoke Upstage AI. Reason: ${error}`);
      return res.status(500).json({ message: 'Failed to invoke model' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
