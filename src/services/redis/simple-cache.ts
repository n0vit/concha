import * as moment from "moment";
import {
  getFromRedis as redisGet,
  redisDel,
  redisExpireat,
  redisSet,
} from "./client";

/**
 *
 */
export class SimpleCache {
  /**
   *
   * @param name
   * @param defaultValue
   */
  static async get<T = any>(name: string, defaultValue?: T): Promise<T | null> {
    const key = `scanner-simple-cache:${name}`;
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
  static async set<T = any>(
    name: string,
    value: T,
    expirationDate?: moment.Moment | number | string
  ) {
    const key = `scanner-simple-cache:${name}`;
    const str = JSON.stringify(value);

    await redisSet(key, str);

    if (expirationDate) {
      const expireAt = moment.utc(expirationDate).valueOf();

      await redisExpireat(key, Math.trunc(expireAt / 1000));
    }
  }

  /**
   *
   * @param name
   */
  static async del(name: string): Promise<void> {
    const key = `scanner-simple-cache:${name}`;

    await redisDel(key);
  }
}
