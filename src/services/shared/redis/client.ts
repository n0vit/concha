import { appConfig as config } from '@/config'
import { Redis } from 'ioredis';
import { promisify } from 'util';
import { createLoggingMoudule } from '@/utils/logger';
import EnvService from '../env';

const logger = createLoggingMoudule('Redis');
export const client = new Redis(`rediss://default:${config.redis.password}@${config.redis.host}:${config.redis.port}`, {
  maxRetriesPerRequest: null
});

// export const client = new Redis(config.redis.port, config.redis.host, {
//   username: 'default'
// });
// const PASSWORD = config.redis.password;

// if (PASSWORD) {
//   client.auth(config.redis.password, err => {
//     if (!err) {
//       return;
//     }

//     logger.error('[redis]', err.message);
//   });
// }

export const getFromRedis = promisify(client.get).bind(client);
export const scanFromRedis = promisify(client.scan).bind(client);
export const redisExpireat = promisify(client.expireat).bind(client);
export const redisMSet = promisify(client.mset).bind(client) as Redis['mset'];
export const redisMGet = promisify(client.mget).bind(client) as Redis['mget'];
export const redisGet = promisify(client.get).bind(client);
export const redisSet = promisify(client.set).bind(client);
export const redisDel = promisify(client.del).bind(client) as Redis['del'];

export const redisHSet = promisify(client.hset).bind(client);
export const redisHGet = promisify(client.hget).bind(client);

client.on('connect', function () {
  logger.info('Redis client connected');
  logger.info(`Connected as dev: ${EnvService.isDevelopment()}`);
});

client.on('error', err => {
  logger.error(err);
});

export default {
  RedisClient: client,
  RedisGetAsync: getFromRedis,
  RedisScanAsync: scanFromRedis
};
