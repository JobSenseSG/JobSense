import crypto from 'crypto';

/* ------------------------------------------------------------------ */
/* Redis + LRU cache                                                  */
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
        connectTimeout: 10000,
        commandTimeout: 5000,
        connectTimeout: 10000,
        commandTimeout: 5000,
        maxRetriesPerRequest: 3,
      });
      await redisClient.ping();
      await redisClient.ping();
      console.info('[Redis] connected');
    } catch (err) {
      console.error('[Redis] connection failed – fallback to memory cache');
      redisClient = null;
    }
  }
  return redisClient;
};

const MEMORY_LIMIT = 1000;
const memoryCache = new Map();
const MEMORY_LIMIT = 1000;
const memoryCache = new Map();

const getFromMemory = (key) => {
const getFromMemory = (key) => {
  if (!memoryCache.has(key)) return null;
  const value = memoryCache.get(key);
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

const CACHE_TTL = 3600;
const CACHE_TTL = 3600;

const getCached = async (key) => {
const getCached = async (key) => {
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
/* SageMaker client setup                                             */
/* SageMaker client setup                                             */
/* ------------------------------------------------------------------ */
// We'll use mlvoca.com for lightweight LLM generation instead of SageMaker here

/* ------------------------------------------------------------------ */
/* Deterministic cache key builder                                    */
/* Deterministic cache key builder                                    */
/* ------------------------------------------------------------------ */
const buildKey = (resume, skills) => {
  const normResume = resume.replace(/\s+/g, ' ').trim().toLowerCase();
  const normSkills = Array.isArray(skills)
    ? skills
        .map((s) => s.trim().toLowerCase())
        .sort()
        .join(',')
    : '';
  return `${normResume.slice(0, 500)}|${normSkills}`;
};

// Simple fallback: count exact skill keyword matches in resume text
const computeFallbackResult = (resume, skills) => {
  try {
    const text = (resume || '').toLowerCase();
    const matched = [];
    for (const s of skills || []) {
      const skill = (s || '').toLowerCase();
      if (!skill) continue;
      // word boundary match to avoid partial hits
      const re = new RegExp(`\\b${skill.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'i');
      if (re.test(text)) matched.push(s);
    }
    const total = Array.isArray(skills) ? skills.length : 0;
    const matchedCount = matched.length;
    const compatibility = total > 0 ? Math.round((matchedCount / total) * 100) : 0;
    return {
      compatibility_score: compatibility,
      matched_skills: matched,
      total_required: total,
      fallback: true,
    };
  } catch (e) {
    return {
      compatibility_score: 0,
      matched_skills: [],
      total_required: Array.isArray(skills) ? skills.length : 0,
      fallback: true,
      error: String(e),
    };
  }
};

/* ------------------------------------------------------------------ */
/* API handler                                                        */
/* API handler                                                        */
/* ------------------------------------------------------------------ */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  const { resume, skills } = req.body;
  const { resume, skills } = req.body;

  if (!resume || !Array.isArray(skills)) {
    return res.status(400).json({ error: 'Invalid request body' });
  if (!resume || !Array.isArray(skills)) {
    return res.status(400).json({ error: 'Invalid request body' });
  }

  const payload = { resume, skills };
  const cacheKey = buildKey(resume, skills);

  const cachedResult = await getCached(cacheKey);
  if (cachedResult) {
    console.log('[Cache Hit]');
    return res.status(200).json({ ...cachedResult, cached: true });
  const payload = { resume, skills };
  const cacheKey = buildKey(resume, skills);

  const cachedResult = await getCached(cacheKey);
  if (cachedResult) {
    console.log('[Cache Hit]');
    return res.status(200).json({ ...cachedResult, cached: true });
  }

  try {
    const apiResp = await fetch('https://mlvoca.com/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'deepseek-r1:1.5b',
        prompt: `Evaluate compatibility for resume and skills. Resume: ${resume} Skills: ${skills.join(',')}`,
        stream: false,
        options: { temperature: 0.3, max_tokens: 800 },
      }),
    });

    if (!apiResp.ok) {
      const txt = await apiResp.text();
      console.error('mlvoca error', apiResp.status, txt);
      const fallback = computeFallbackResult(resume, skills);
      await setCached(cacheKey, fallback);
      return res.status(200).json({ ...fallback, cached: false });
    }

    const payloadResp = await apiResp.json();
    // Expect the model to return a JSON-like string; attempt to parse, otherwise return raw
    let result = {};
    try {
      const text = (payloadResp && payloadResp.response) ? payloadResp.response : '';
      result = JSON.parse(text);
    } catch (e) {
      // fallback to wrapping raw text
      result = { raw: payloadResp.response };
    }

    await setCached(cacheKey, result);

    return res.status(200).json({ ...result, cached: false });
  } catch (error) {
    console.error('[mlvoca Error]', error);
    const fallback = computeFallbackResult(resume, skills);
    await setCached(cacheKey, fallback);
    return res.status(200).json({ ...fallback, cached: false });
  }
}