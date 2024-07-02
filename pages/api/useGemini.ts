const { GoogleGenerativeAI } = require("@google/generative-ai");

// Access your API key as an environment variable (see "Set up your API key" above)
const genAI = new GoogleGenerativeAI(`AIzaSyDBrsK6EHTWwg5fC16cbIVCF5S0SJ2Tz3c`);

// Exported function to generate content based on a supplied prompt
// payload contains the extracted text of a PDF
export default async function generateContent(req, res) {
    // For text-only input, use the gemini-pro model
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    if (!req.body.role.skills_required) {
        return res.status(200).json({
            compatibility: 0,
            role: req.body.role,
        }); // Returning the generated text
    }

    const prompt = `Parse and rate the resume on how compatible is the candidate to a role using an algorithm and do not justify your answers and do not output text. The algorithm will compute a compatibility score from 1 to 100 based on how many skills required by the role is present in the resume. You must output the compatibility score. The skills required for the role is ${req.body.role.skills_required.toString()}. The resume is shown below: ${req.body.resume}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();

    return res.status(200).json({
        compatibility: text,
        role: req.body.role,
    }); // Returning the generated text
}

// Usage example (you can comment this out or delete it when using the function in your project):
// const story = await generateContent("Write a story about a magic backpack.");
// console.log(story);
