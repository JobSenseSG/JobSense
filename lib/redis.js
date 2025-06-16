import Redis from 'ioredis';

let redis = null;

const getRedisClient = () => {
  if (!redis) {
    try {
      redis = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
        db: process.env.REDIS_DB || 0,
        retryDelayOnFailover: 100,
        enableReadyCheck: false,
        lazyConnect: true,
        maxRetriesPerRequest: 3,
        // Connection timeout
        connectTimeout: 10000,
        // Command timeout
        commandTimeout: 5000,
      });

      redis.on('error', (err) => {
        console.error('Redis connection error:', err);
      });

      redis.on('connect', () => {
        console.log('Redis connected successfully');
      });

      redis.on('ready', () => {
        console.log('Redis ready for commands');
      });

    } catch (error) {
      console.error('Failed to create Redis client:', error);
      redis = null;
    }
  }
  return redis;
};

// Cache helper functions
export const cacheGet = async (key) => {
  try {
    const client = getRedisClient();
    if (!client) return null;
    
    const result = await client.get(key);
    return result ? JSON.parse(result) : null;
  } catch (error) {
    console.error('Redis GET error:', error);
    return null;
  }
};
// Cache helper functions for setting, deleting, checking existence, and getting stats
export const cacheSet = async (key, value, ttlSeconds = 3600) => {
  try {
    const client = getRedisClient();
    if (!client) return false;
    
    await client.setex(key, ttlSeconds, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error('Redis SET error:', error);
    return false;
  }
};

export const cacheDelete = async (key) => {
  try {
    const client = getRedisClient();
    if (!client) return false;
    
    await client.del(key);
    return true;
  } catch (error) {
    console.error('Redis DELETE error:', error);
    return false;
  }
};

export const cacheExists = async (key) => {
  try {
    const client = getRedisClient();
    if (!client) return false;
    
    const exists = await client.exists(key);
    return exists === 1;
  } catch (error) {
    console.error('Redis EXISTS error:', error);
    return false;
  }
};

export const getCacheStats = async () => {
  try {
    const client = getRedisClient();
    if (!client) return null;
    
    const info = await client.info('memory');
    const keyCount = await client.dbsize();
    
    return {
      connected: client.status === 'ready',
      keyCount,
      memoryInfo: info,
    };
  } catch (error) {
    console.error('Redis stats error:', error);
    return null;
  }
};

export default getRedisClient;
