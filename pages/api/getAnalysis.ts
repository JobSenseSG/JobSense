// pages/api/getAnalysis.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

const apiKey = 'up_nwDMy4WRdzgWukb97wN2yAGcwo33H';
const openai = new OpenAI({
  apiKey: apiKey,
  baseURL: 'https://api.upstage.ai/v1/solar',
});

const parseAIResponse = (responseText: string) => {
  const lines: string[] = responseText
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const skillsRecommendation: string[] = [];
  const weaknesses: string[] = [];
  const improvementSuggestions: string[] = [];
  let overallAnalysis: string = '';

  let section:
    | 'skillsRecommendation'
    | 'weaknesses'
    | 'improvementSuggestions'
    | 'overallAnalysis' = 'overallAnalysis';
  lines.forEach((line: string) => {
    if (line.startsWith('Skills Recommendation:')) {
      section = 'skillsRecommendation';
    } else if (line.startsWith('Weaknesses:')) {
      section = 'weaknesses';
    } else if (line.startsWith('Improvement Suggestions:')) {
      section = 'improvementSuggestions';
    } else if (line.startsWith('Overall Analysis:')) {
      section = 'overallAnalysis';
    } else {
      switch (section) {
        case 'skillsRecommendation':
          skillsRecommendation.push(line);
          break;
        case 'weaknesses':
          weaknesses.push(line);
          break;
        case 'improvementSuggestions':
          improvementSuggestions.push(line);
          break;
        case 'overallAnalysis':
          overallAnalysis += line + ' ';
          break;
        default:
          break;
      }
    }
  });

  return {
    skillsRecommendation,
    weaknesses,
    improvementSuggestions,
    overallAnalysis: overallAnalysis.trim(),
  };
};
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { answers } = req.body;

    // Extract the necessary values from the answers object
    const companyName = answers.companyName?.value || 'Unknown Company';
    const teamSize = answers.teamSize?.value[0] || 'Unknown Team Size';
    const fundingStage =
      answers.fundingStage?.value[0] || 'Unknown Funding Stage';
    const industryFocus =
      answers.industryFocus?.value || 'Unknown Industry Focus';
    const objectives = answers.objectives?.value || 'No Objectives Provided';
    const extractedText = answers.extractedText?.value || 'No Text Provided';
    console.log('Extracted Text from PDF:', extractedText);

    // Use template literals to dynamically create the prompt string
    const prompt = `Based on Company Name: ${companyName}\nTeam Size: ${teamSize}\nFunding Stage: ${fundingStage}\nIndustry Focus: ${industryFocus}\nObjectives: ${objectives}\nTeam Resume: ${extractedText}, recommend me recommended skills, weaknesses, improvement suggestion, and overall analysis of the company`;

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

    const responseText =
      chatCompletion.choices?.[0]?.message?.content?.trim() || '';
    console.log('response from open ai: ', responseText);
    const analysisData = parseAIResponse(responseText);

    res.status(200).json(analysisData);
  } catch (error) {
    console.error('Error in getAnalysis handler:', error);
    res.status(500).json({ error: 'Error fetching data from OpenAI' });
  }
}