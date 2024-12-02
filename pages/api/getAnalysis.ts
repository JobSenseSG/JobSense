// pages/api/getAnalysis.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

const apiKey = "up_q4SzgaQKW3DyDNb8U7p75W33XsWLd";
const openai = new OpenAI({
    apiKey: apiKey,
    baseURL: "https://api.upstage.ai/v1/solar",
});


const parseAIResponse = (responseText: string) => {
    const lines: string[] = responseText.split('\n').map(line => line.trim()).filter(line => line.length > 0);

    const skillsRecommendation: string[] = [];
    const weaknesses: string[] = [];
    const improvementSuggestions: string[] = [];
    let overallAnalysis: string = '';

    let section: 'skillsRecommendation' | 'weaknesses' | 'improvementSuggestions' | 'overallAnalysis' = 'overallAnalysis';
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
        overallAnalysis: overallAnalysis.trim()
    };
};
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { answers } = req.body;

        // Extract the necessary values from the answers object
        const companyName = answers.companyName?.value || "Unknown Company";
        const teamSize = answers.teamSize?.value[0] || "Unknown Team Size";
        const fundingStage = answers.fundingStage?.value[0] || "Unknown Funding Stage";
        const industryFocus = answers.industryFocus?.value || "Unknown Industry Focus";
        const objectives = answers.objectives?.value || "No Objectives Provided";
        const extractedText = answers.extractedText?.value || "No Text Provided";
        console.log("Extracted Text from PDF:", extractedText);

        // Use template literals to dynamically create the prompt string
        //const prompt = `Based on Company Name: ${companyName}\nTeam Size: ${teamSize}\nFunding Stage: ${fundingStage}\nIndustry Focus: ${industryFocus}\nObjectives: ${objectives}\nTeam Resume: ${extractedText}, 
        //give me these 3 things first is recommended skills, second is weaknesses, third is improvement suggestion, and last is overall analysis of the company. Must give everything. Separate each section with -------- and for each point in the section DONT start with * remember that`;


        const prompt = `Based on the following company information FOLLOW THE FORMAT:
        Company Name: ${companyName},
        Team Size: ${teamSize},
        Funding Stage: ${fundingStage},
        Industry Focus: ${industryFocus},
        Objectives: ${objectives},
        extractedText: ${extractedText}

        ----------

        Please provide the analysis in the following format:

        1. Recommended Skills
        - List key skills and expertise areas recommended for the company.
        - For each skill, include:
            - Skill: Name of the skill.
            - Reason: Explanation of why this skill is important for the company's goals.
            - Areas to Improve: Specific actions or training areas for enhancing the skill.
        
        ------------

        2. Weaknesses
        - List the company's current weaknesses or gaps in expertise.
        - Provide a brief description of each weakness.

        ------------

        3. Improvement Suggestions
        - Suggest actionable steps or strategies for addressing the identified weaknesses.
        - Each suggestion should be clear and actionable.
        ------------

        4. Overall Analysis
        - Provide a summary of the company’s current state, highlighting strengths, weaknesses, and areas for improvement.
        - Offer a cohesive narrative that ties together the recommendations, weaknesses, and suggestions.

        Ensure that the response is structured with each section clearly separated and labeled. Avoid numbering any points in the list sections and maintain a smooth narrative flow for the overall analysis.
        the example is like below follow the format and its just example

        Company: JobSense

        Team Size: 1-5

        Funding Stage: Pre-seed

        Industry Focus: AI/ML

        Objectives: Expand market reach, enhance product features, support enterprise solutions, and achieve financial growth.

        ------------

        Recommended Skills
        Cloud Computing: The team lacks expertise in cloud computing, which is essential for scaling AI/ML applications and managing data storage and processing in the cloud.
        Areas to Improve: Upskill in cloud platforms such as AWS, Azure, or Google Cloud, with a focus on AI/ML services.
        Advanced Data Analysis: With the focus on AI/ML, having advanced data analysis skills is crucial for making sense of large datasets and improving model accuracy.
        Areas to Improve: Consider training in advanced statistics, machine learning algorithms, and tools like TensorFlow or PyTorch.
        DevOps for AI/ML: Adopting DevOps practices tailored for AI/ML can streamline the development and deployment of machine learning models, ensuring consistency and scalability.
        Areas to Improve: Focus on CI/CD pipelines for AI/ML, containerization using Docker, and orchestration with Kubernetes.

        ------------

        Weaknesses
        Limited experience with cloud-based AI/ML services.
        Lack of expertise in advanced data analysis techniques.
        Inconsistent use of DevOps practices for AI/ML model deployment.
        
        ------------

        Improvement Suggestions
        Organize training sessions on cloud platforms and AI/ML services.
        Encourage team members to participate in advanced data analysis workshops.
        Implement a standardized DevOps process for AI/ML model deployment.

        ------------

        Overall Analysis
        The JobSense team shows promise in AI/ML but needs to address key skill gaps in cloud computing, advanced data analysis, and DevOps for AI/ML. Strengthening these areas will help the team better achieve its growth objectives and enhance its product offerings.
        
        just follow the format including the endline including the SEPARATOR
        `;
        


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

        const responseText = chatCompletion.choices?.[0]?.message?.content?.trim() || '';
        console.log("response from open ai: ", responseText);
        const analysisData = parseAIResponse(responseText);

        res.status(200).json(analysisData);
    } catch (error) {
        console.error("Error in getAnalysis handler:", error);
        res.status(500).json({ error: 'Error fetching data from OpenAI' });
    }
}
