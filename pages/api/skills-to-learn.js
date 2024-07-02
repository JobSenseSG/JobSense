// pages/api/skills-to-learn.js
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(`AIzaSyDBrsK6EHTWwg5fC16cbIVCF5S0SJ2Tz3c`); // Make sure API key is set properly

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { resumeText, previousResponse } = req.body;
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const prompt = `You are helping a friend upskill himself so that he can get a job in the tech industry. Based on his resume/information below, give 1 skill you would recommend him to learn? 
: ${resumeText} Please return the title of the skill AND give why he should learn it in 100 words.Do NOT recommend the same langauge in ${previousResponse} please use a DIFFRENT RECOMMENDATION ALL THE TIME`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = await response.text();

      return res.status(200).send(text); // Send the response as plain text
    } catch (error) {
      console.error("Error generating content:", error);
      res.status(500).json({ error: "Failed to generate content" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
