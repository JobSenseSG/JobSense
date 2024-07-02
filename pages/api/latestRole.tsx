import type { NextApiRequest, NextApiResponse } from 'next'
const pool = require('../../lib/db.js'); // Update the path to where your actual db config file is located
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Access your API key as an environment variable (see "Set up your API key" above)
const genAI = new GoogleGenerativeAI(`AIzaSyDBrsK6EHTWwg5fC16cbIVCF5S0SJ2Tz3c`);

type ResponseData = {
  message: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method == 'POST') {

    if (!req.body.resume) {
      res.status(400).json({ message: 'Resume must not be null' })
    }

    // For text-only input, use the gemini-pro model
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `Parse and output the candidate's latest role based on their resume and do not justify your answers and do not display the company name. The resume is shown below: ${req.body.resume}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();

    return res.status(200).json({ latestRole: text });

  } else {
    res.status(400).json({ message: 'Method not supported ' })
  }
}
