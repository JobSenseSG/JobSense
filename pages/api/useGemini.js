import {
  BedrockRuntimeClient,
  InvokeModelWithResponseStreamCommand,
} from '@aws-sdk/client-bedrock-runtime';

const cache = new Map();

const bedrockClient = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || 'us-east-1',
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { role, resume } = req.body;

  // Validate inputs
  if (!resume || typeof resume !== 'string') {
    return res.status(400).json({ error: 'Resume is required and must be a string' });
  }

  if (!role || typeof role !== 'object') {
    return res.status(400).json({ error: 'Role is required and must be an object' });
  }

  const safeRole = {
    company: role?.company || 'Unknown Company',
    title: role?.title || 'Untitled Role',
    skills_required: Array.isArray(role?.skills_required) ? role.skills_required : [],
    job_url: role?.job_url || null,
  };

  // Return 0 if no skills required
  if (!Array.isArray(role?.skills_required) || role.skills_required.length === 0) {
    return res.status(200).json({
      compatibility: 0,
      role: safeRole,
      cached: false,
      reason: 'No skills required'
    });
  }

  // Generate cache key (your original logic)
  const cacheKey = `${resume.slice(0, 500)}|${role?.title}|${role?.company}|${(role?.skills_required || []).sort().join(',')}`;

  // Check cache first (your original logic)
  if (cache.has(cacheKey)) {
    console.log(`[CACHE HIT] ${role?.title}: ${cache.get(cacheKey)}%`);
    return res.status(200).json({
      compatibility: cache.get(cacheKey),
      role: safeRole,
      cached: true,
    });
  }

  console.log(`[ANALYZING] ${role?.title} - Skills: [${role.skills_required.join(', ')}]`);

  // Your original prompt
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

Role Required Skills: ${role.skills_required.sort().join(', ')}.

Resume: ${resume}
`;

  // Your original command
  const command = new InvokeModelWithResponseStreamCommand({
    modelId: 'anthropic.claude-3-sonnet-20240229-v1:0',
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify({
      anthropic_version: 'bedrock-2023-05-31',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 100,
      temperature: 0,
    }),
  });

  try {
    const response = await bedrockClient.send(command);

    let fullResponse = '';

    // Your original stream parsing
    for await (const chunk of response.body) {
      if (chunk.chunk?.bytes) {
        const text = new TextDecoder().decode(chunk.chunk.bytes);
        if (text) {
          try {
            const parsed = JSON.parse(text);
            if (parsed.delta?.text) {
              fullResponse += parsed.delta.text;
            }
          } catch (parseError) {
            console.warn('Failed to parse chunk:', text);
          }
        }
      }
    }

    console.log(`[CLAUDE FULL RESPONSE] "${fullResponse}"`);

    // Your original parsing logic
    const trimmed = fullResponse.trim();
    const compatibility = parseInt(trimmed.match(/\d+/)?.[0] || '0', 10);

    // Ensure valid range
    const validCompatibility = Math.max(0, Math.min(100, compatibility));

    // 🔥 CRITICAL FIX: Actually save to cache (this was missing!)
    cache.set(cacheKey, validCompatibility);

    console.log(`[FINAL RESULT] ${role?.title}: ${validCompatibility}%`);

    return res.status(200).json({
      compatibility: validCompatibility,
      role: safeRole,
      cached: false,
      debug: {
        rawResponse: fullResponse,
        parsedScore: validCompatibility
      }
    });

  } catch (error) {
    console.error(`ERROR: Can't invoke AWS Claude 3 model. Reason: ${error.message}`);
    
    // Handle rate limiting
    if (error.name === 'ThrottlingException' || error.$metadata?.httpStatusCode === 429) {
      return res.status(429).json({ 
        error: 'Too many requests. Please wait before trying again.',
        retryAfter: 5000
      });
    }

    if (error.name === 'ValidationException') {
      return res.status(400).json({ 
        error: 'Invalid request to Claude API',
        details: error.message 
      });
    }

    return res.status(500).json({ 
      error: 'Failed to invoke model',
      details: error.message,
      role: safeRole,
      compatibility: 0,
      cached: false
    });
  }
}
