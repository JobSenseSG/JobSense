import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

const apiKey = 'up_nwDMy4WRdzgWukb97wN2yAGcwo33H'; // Replace with your actual API key
const openai = new OpenAI({
  apiKey: apiKey,
  baseURL: 'https://api.upstage.ai/v1/solar',
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { resumeText } = req.body;

  const prompt = `Based on the person's current role and experience as described in their resume below, return ONLY the next logical higher role with a maximum of 4 words.  Do not include any additional text, explanations, or formatting. Only return the role title.

Here is their current resume:

${resumeText}`;


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

      // Check if choices are available
      if (!chatCompletion.choices || chatCompletion.choices.length === 0) {
        throw new Error('No choices were returned from the AI.');
      }

      // Get the first choice
      const firstChoice = chatCompletion.choices[0];

      // Check if the message is available
      if (!firstChoice.message || !firstChoice.message.content) {
        throw new Error('No message content was returned from the AI.');
      }

      // Now it's safe to access message.content
      const responseText = firstChoice.message.content.trim();

      // Since we expect only a single role title, we can directly use responseText
      const roleTitle = responseText;
      // const roleTitle = 'Senior Software Engineer'; // Replace with the actual role title

      res.status(200).json({ roleTitle }); // Return the role title
    } catch (error) {
      console.error(`ERROR: Can't invoke AI. Reason: ${error}`);
      res.status(500).json({ error: 'Failed to invoke model' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
