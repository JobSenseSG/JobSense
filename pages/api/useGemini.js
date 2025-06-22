import AWS from 'aws-sdk';
import crypto from 'crypto';

/* ------------------------------------------------------------------ */
/* Redis + LRU cache (copied over from Bedrock handler)               */
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
        maxRetriesPerRequest: 3,
      });
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
/* ------------------------------------------------------------------ */
console.log('Using endpoint:', process.env.SAGEMAKER_ENDPOINT_NAME);

const sagemakerRuntime = new AWS.SageMakerRuntime({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

/* ------------------------------------------------------------------ */
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

/* ------------------------------------------------------------------ */
/* API handler                                                        */
/* ------------------------------------------------------------------ */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  const { resume, skills } = req.body;

  if (!resume || !Array.isArray(skills)) {
    return res.status(400).json({ error: 'Invalid request body' });
  }

  const payload = { resume, skills };
  const cacheKey = buildKey(resume, skills);

  const cachedResult = await getCached(cacheKey);
  if (cachedResult) {
    console.log('[Cache Hit]');
    return res.status(200).json({ ...cachedResult, cached: true });
  }

  try {
    const response = await sagemakerRuntime
      .invokeEndpoint({
        EndpointName: process.env.SAGEMAKER_ENDPOINT_NAME,
        Body: JSON.stringify(payload),
        ContentType: 'application/json',
        Accept: 'application/json',
      })
      .promise();

    const result = JSON.parse(Buffer.from(response.Body).toString());

    await setCached(cacheKey, result);

    return res.status(200).json({ ...result, cached: false });
  } catch (error) {
    console.error('[SageMaker Error]', error);
    return res
      .status(500)
      .json({ error: 'Failed to invoke model', details: error.message });
  }
}
