import { appConfig as config } from "../config/config";
import cache from "memory-cache";

const ttl = config.cache.ttl * 1000;
const enabled = config.cache.enabled;

/**
 *
 * @param {String} key
 * @param {String} value
 */
function set(key: string, value: string) {
  if (!enabled) {
    return;
  }

  cache.put(key, value, ttl);
}

/**
 *
 * @param {String} key
 */
function get(key: string) {
  /* istanbul ignore next */
  if (!enabled) {
    return null;
  }

  return cache.get(key);
}

/**
 *
 * @param {String} key
 */
function del(key: string) {
  /* istanbul ignore next */
  if (!enabled) {
    return;
  }

  cache.del(key);
}

export { set };
export { get };
export { del };
