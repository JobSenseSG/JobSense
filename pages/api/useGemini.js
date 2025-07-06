/**
 *  Job-qualification compatibility API
 *  – With Redis + in-process LRU cache restored –
 *  (LLM prompt / Bedrock logic remains **unchanged**)
 */
import {
  BedrockRuntimeClient,
  InvokeModelWithResponseStreamCommand,
} from '@aws-sdk/client-bedrock-runtime';

/* ------------------------------------------------------------------ */
/*  Redis (lazy import so the bundle stays browser-safe)               */
/* ------------------------------------------------------------------ */
let RedisMod = null;
let redisClient = null;

const getRedisClient = async () => {
  if (!RedisMod) {
    try {
      const mod = await import('ioredis');
      RedisMod = mod.default;
    } catch (err) {
      console.error('[Redis] dynamic import failed – fallback to memory cache');
      return null;
    }
  }
  if (!redisClient) {
    try {
      redisClient = new RedisMod({
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
        db: process.env.REDIS_DB || 0,
        lazyConnect: false,
        connectTimeout: 10_000,
        commandTimeout: 5_000,
        maxRetriesPerRequest: 3,
      });
      await redisClient.ping();                 // health probe
      console.info('[Redis] connected');
    } catch (err) {
      console.error('[Redis] connection failed – fallback to memory cache');
      redisClient = null;
    }
  }
  return redisClient;
};

/* ------------------------------------------------------------------ */
/*  In-process LRU cache (oldest eviction)                             */
/* ------------------------------------------------------------------ */
const MEMORY_LIMIT = 1_000;
const memoryCache = new Map(); // maintains insertion order

const getFromMemory = key => {
  if (!memoryCache.has(key)) return null;
  const value = memoryCache.get(key);
  // promote to MRU
  memoryCache.delete(key);
  memoryCache.set(key, value);
  return value;
};

const setInMemory = (key, value) => {
  if (memoryCache.size >= MEMORY_LIMIT) {
    const oldestKey = memoryCache.keys().next().value;
    memoryCache.delete(oldestKey);
  }
  memoryCache.set(key, value);
};

/* ------------------------------------------------------------------ */
/*  Cache helpers that work with Redis if available                    */
/* ------------------------------------------------------------------ */
const CACHE_TTL = 3_600; // 1 h

const getCached = async key => {
  const redis = await getRedisClient();
  if (redis) {
    const raw = await redis.get(key);
    if (raw) return JSON.parse(raw);
  }
  return getFromMemory(key);
};

const setCached = async (key, value) => {
  const redis = await getRedisClient();
  if (redis) {
    redis.setex(key, CACHE_TTL, JSON.stringify(value)).catch(() => {});
  }
  setInMemory(key, value);
};

/* ------------------------------------------------------------------ */
/*  Bedrock client (LLM logic untouched)                               */
/* ------------------------------------------------------------------ */
const bedrockClient = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || 'us-east-1',
});

/* ------------------------------------------------------------------ */
/*  Utility: simple deterministic cache key                            */
/* ------------------------------------------------------------------ */
const buildKey = (resume, role) => {
  const normRes   = resume.replace(/\s+/g, ' ').trim().toLowerCase();
  const normTitle = (role?.title   || '').toLowerCase();
  const normCo    = (role?.company || '').toLowerCase();
  const normSkills = Array.isArray(role?.skills_required)
    ? role.skills_required.map(s => s.trim().toLowerCase()).sort().join(',')
    : '';
  return `${normRes.slice(0,500)}|${normTitle}|${normCo}|${normSkills}`;
};

/* ------------------------------------------------------------------ */
/*  API Route                                                          */
/* ------------------------------------------------------------------ */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  const { resume, skills } = req.body;

  /* ------------ validation (unchanged) ------------ */
  if (!resume || typeof resume !== 'string') {
    return res.status(400).json({ error: 'Resume is required and must be a string' });
  }
  if (!role || typeof role !== 'object') {
    return res.status(400).json({ error: 'Role is required and must be an object' });
  }

  const safeRole = {
    company: role?.company || 'Unknown Company',
    title  : role?.title   || 'Untitled Role',
    skills_required: Array.isArray(role?.skills_required) ? role.skills_required : [],
    job_url: role?.job_url || null,
  };

  if (!Array.isArray(role?.skills_required) || role.skills_required.length === 0) {
    return res.status(200).json({
      compatibility: 0,
      role: safeRole,
      cached: false,
      reason: 'No skills required',
    });
  }

  /* ------------ cache lookup ------------ */
  const cacheKey = buildKey(resume, role);
  const cachedVal = await getCached(cacheKey);
  if (cachedVal !== null) {
    console.log(`[CACHE HIT] ${role?.title}: ${cachedVal}%`);
    return res.status(200).json({
      compatibility: cachedVal,
      role: safeRole,
      cached: true,
    });
  }

  console.log(`[ANALYZING] ${role?.title} - Skills: [${role.skills_required.join(', ')}]`);

  /* ------------ LLM prompt (unchanged) ------------ */
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

    /* ------------ stream assembly (unchanged) ------------ */
    let fullResponse = '';
    for await (const { chunk } of response.body) {
      if (!chunk?.bytes) continue;
      const part = new TextDecoder().decode(chunk.bytes);
      if (!part) continue;
      try {
        const { delta } = JSON.parse(part.trim());
        if (delta?.text) fullResponse += delta.text;
      } catch {/* ignore partial frames */}
    }

    console.log(`[CLAUDE FULL RESPONSE] "${fullResponse}"`);

    const compatibility = Math.max(
      0,
      Math.min(
        100,
        parseInt(fullResponse.trim().match(/\d+/)?.[0] || '0', 10),
      ),
    );

    /* ------------ save to cache ------------ */
    await setCached(cacheKey, compatibility);

    console.log(`[FINAL RESULT] ${role?.title}: ${compatibility}%`);

    return res.status(200).json({
      compatibility,
      role: safeRole,
      cached: false,
      debug: {
        rawResponse: fullResponse,
        parsedScore: compatibility,
      },
    });
  } catch (err) {
    console.error('[API] error', err);
    const http = err.$metadata?.httpStatusCode || 500;

    if (http === 429 || err.name === 'ThrottlingException') {
      return res.status(429).json({ error: 'Rate-limited', retryAfter: 5000 });
    }
    if (err.name === 'ValidationException') {
      return res.status(400).json({ error: 'Invalid Bedrock request', details: err.message });
    }

    return res.status(500).json({
      error: 'Internal error',
      details: err.message,
      role: safeRole,
      compatibility: 0,
      cached: false,
    });
  }
}
