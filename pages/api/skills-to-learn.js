// Using external mlvoca free LLM API (DeepSeek)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { resumeText } = req.body;

  const prompt = `I want to upskill to get a job in the tech industry. Identify 3 distinct skills that he does not already know and would benefit from learning. Return each skill in the following format:

1. Skill Title 
-----------------------
(Reason for learning the skill roughly 3 sentences long).

2. Skill Title
-----------------------
(Reason for learning the skill roughly 3 sentences long).

3. Skill Title
-----------------------
(Reason for learning the skill roughly 3 sentences long).

Ensure that there is a clear separation between the title and the reason with a line of dashes, and separate each skill entry with two new lines. The skill titles should be single-line and the reasons should be clear and concise. Don't put bracket () between the skill title. Here is his current skillset:

${resumeText}`;

  // Call mlvoca free LLM API (non-streaming)
  try {
    const apiResp = await fetch('https://mlvoca.com/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'deepseek-r1:1.5b',
        prompt,
        stream: false,
        options: { temperature: 0.5, max_tokens: 1000 },
      }),
    });

    if (!apiResp.ok) {
      const txt = await apiResp.text();
      console.error('mlvoca error', apiResp.status, txt);
      // Fallback: generate simple skill recommendations
      const fallback = computeSkillsFallback(resumeText);
      return res.status(200).json(fallback);
    }

    const payload = await apiResp.json();
    const fullResponse = (payload && payload.response) || '';

    const skills = fullResponse
      .trim()
      .split(/\n\s*\n/)
      .map((skill) => {
        const parts = skill.split(/\n-{2,}\n/);
        if (parts.length === 2) {
          const title = parts[0].trim().replace(/^\d+\.\s*/, '');
          const points = parts[1].trim();
          return { title, points };
        }
        return null;
      })
      .filter((skill) => skill !== null);

    return res.status(200).json(skills);
  } catch (error) {
    console.error('Error invoking mlvoca DeepSeek:', error);
    const fallback = computeSkillsFallback(resumeText);
    return res.status(200).json(fallback);
  }
}

// Fallback generator: propose up to 3 skills not already present in resume
function computeSkillsFallback(resume) {
  const knownSkills = [
    'Python',
    'SQL',
    'Data Analysis',
    'Machine Learning',
    'Tableau',
    'Power BI',
    'AWS',
    'Docker',
    'Kubernetes',
    'React',
    'Node.js',
    'DevOps',
    'Product Management',
    'Statistics',
    'Communication',
  ];

  const text = (resume || '').toLowerCase();
  const present = new Set();
  for (const s of knownSkills) {
    try {
      const token = s.toLowerCase();
      if (token && text.includes(token)) present.add(s);
    } catch (e) {}
  }

  const recommendations = [];
  for (const s of knownSkills) {
    if (!present.has(s) && recommendations.length < 3) {
      recommendations.push({
        title: s,
        points: `${s} is highly valuable for tech roles. Learning ${s} will increase your ability to deliver on projects and improve your hiring competitiveness. Focus on practical projects and hands-on exercises to build proficiency.`,
      });
    }
  }

  // If not enough recommendations, add generic soft skills
  const fillers = [
    { title: 'Communication', points: 'Effective communication helps clearly present technical ideas to non-technical stakeholders.' },
    { title: 'Problem Solving', points: 'Structured problem solving improves debugging and solution design.' },
    { title: 'Time Management', points: 'Prioritizing tasks helps deliver projects on schedule and reduces burnout.' },
  ];

  let i = 0;
  while (recommendations.length < 3 && i < fillers.length) {
    recommendations.push(fillers[i]);
    i += 1;
  }

  return recommendations;
}
