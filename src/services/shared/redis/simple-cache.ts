import * as moment from 'moment';
import { getFromRedis as redisGet, redisDel, redisExpireat, redisSet, redisMSet, redisMGet } from './client';
import * as EnvService from '@/services/shared/env';

/**
 *
 */

const SimpleCacheKey = EnvService.isProduction() ? 'scanner-simple-cache:' : 'dev:scanner-simple-cache:';
export class SimpleCache {
  /**
   *
   * @param name
   * @param defaultValue
   */
  static async get<T = any>(name: string, defaultValue?: T): Promise<T | null> {
    const key = SimpleCacheKey + name;
    const result = await redisGet(key);

    if (result) {
      return JSON.parse(result) as T;
    }

    return defaultValue ?? null;
  }

  /**
   *
   * @param name
   * @param value
   * @param expirationDate
   */
  static async set<T = any>(name: string, value: T, expirationDate?: moment.Moment | number | string) {
    const key = SimpleCacheKey + name;
    const str = JSON.stringify(value);

    await redisSet(key, str);

    if (expirationDate) {
      const expireAt = moment.utc(expirationDate).valueOf();

      await redisExpireat(key, Math.trunc(expireAt / 1000));
    }
  }

  static async multiSet<T = any>(data: Record<string | number, T>) {
    const kyes = Object.keys(data);
    const fullKeysData: Record<string | number, string> = {};

    kyes.forEach(k => {
      fullKeysData[SimpleCacheKey + k] = JSON.stringify(data[k]);
    });

    await redisMSet(fullKeysData);
  }

  static async multiGet<T extends Array<any>>(names: Array<string | number>, defaultValue?: T): Promise<T | null> {
    const keys = names.map(k => SimpleCacheKey + k);
    const result = await redisMGet(keys);
    if (result) {
      return result.map(r => (r ? JSON.parse(r) : null)) as T;
    }

    return defaultValue ?? null;
  }
  /**
   *
   * @param name
   */
  static async del(name: string): Promise<void> {
    const key = SimpleCacheKey + name;

    await redisDel(key);
  }
}
