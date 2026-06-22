'use strict';
/**
 * Redis Configuration & Connection
 * 
 * Sử dụng ioredis để kết nối tới Redis (AWS ElastiCache).
 * Cung cấp các helper methods cho Cache-Aside pattern.
 */
const Redis = require('ioredis');

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

const redis = new Redis(REDIS_URL, {
  maxRetriesPerRequest: 3,
  enableOfflineQueue: false,
  retryStrategy(times) {
    if (times > 3) {
      console.warn('[Redis] ❌ Connection failed after 3 attempts. Caching is disabled (fail-open).');
      return null;
    }
    const delay = Math.min(times * 200, 2000);
    console.log(`[Redis] Retrying connection... attempt ${times}, delay ${delay}ms`);
    return delay;
  },
  reconnectOnError(err) {
    const targetError = 'READONLY';
    if (err.message.includes(targetError)) {
      // Reconnect khi ElastiCache failover
      return true;
    }
    return false;
  }
});

redis.on('connect', () => {
  console.log('[Redis] ✅ Connected to Redis successfully');
});

redis.on('error', (err) => {
  console.error('[Redis] ❌ Connection error:', err.message);
});

redis.on('close', () => {
  console.log('[Redis] Connection closed');
});

// =============================================
// Cache-Aside Helper Methods
// =============================================

const DEFAULT_TTL = 300; // 5 phút (giây)

/**
 * Lấy dữ liệu từ cache. Trả về null nếu không có.
 * @param {string} key - Cache key
 * @returns {Promise<any|null>}
 */
async function getCache(key) {
  try {
    const cached = await redis.get(key);
    if (cached) {
      return JSON.parse(cached);
    }
    return null;
  } catch (err) {
    console.error(`[Redis] getCache error for key "${key}":`, err.message);
    return null; // Fail-open: nếu Redis lỗi thì coi như cache miss
  }
}

/**
 * Lưu dữ liệu vào cache với TTL.
 * @param {string} key - Cache key
 * @param {any} data - Dữ liệu cần cache (sẽ được JSON.stringify)
 * @param {number} ttl - Time-to-live tính bằng giây (mặc định 5 phút)
 */
async function setCache(key, data, ttl = DEFAULT_TTL) {
  try {
    await redis.set(key, JSON.stringify(data), 'EX', ttl);
  } catch (err) {
    console.error(`[Redis] setCache error for key "${key}":`, err.message);
    // Fail-open: không throw, chỉ log
  }
}

/**
 * Xóa cache theo key chính xác.
 * @param {string} key - Cache key cần xóa
 */
async function deleteCache(key) {
  try {
    await redis.del(key);
  } catch (err) {
    console.error(`[Redis] deleteCache error for key "${key}":`, err.message);
  }
}

/**
 * Xóa tất cả cache keys theo pattern (dùng SCAN để an toàn cho production).
 * Ví dụ: deleteCacheByPattern('plants:*') sẽ xóa tất cả cache liên quan đến plants.
 * @param {string} pattern - Redis key pattern (ví dụ: 'plants:*')
 */
async function deleteCacheByPattern(pattern) {
  try {
    const stream = redis.scanStream({ match: pattern, count: 100 });
    const pipeline = redis.pipeline();
    let deletedCount = 0;

    return new Promise((resolve, reject) => {
      stream.on('data', (keys) => {
        if (keys.length) {
          keys.forEach(key => pipeline.del(key));
          deletedCount += keys.length;
        }
      });
      stream.on('end', async () => {
        if (deletedCount > 0) {
          await pipeline.exec();
          console.log(`[Redis] Invalidated ${deletedCount} keys matching "${pattern}"`);
        }
        resolve(deletedCount);
      });
      stream.on('error', (err) => {
        console.error(`[Redis] deleteCacheByPattern error:`, err.message);
        resolve(0); // Fail-open
      });
    });
  } catch (err) {
    console.error(`[Redis] deleteCacheByPattern error for "${pattern}":`, err.message);
  }
}

module.exports = {
  redis,
  getCache,
  setCache,
  deleteCache,
  deleteCacheByPattern,
  DEFAULT_TTL
};
