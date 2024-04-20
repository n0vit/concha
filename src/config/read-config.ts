import * as config from "../../config/app.json";
import { AppConfig } from "./types";

let appConfig: AppConfig | null = null;

export function readConfig(): AppConfig {
  if (appConfig != null) {
    return appConfig;
  }

  appConfig = handleEnvVars(config);

  return appConfig;
}

function handleEnvVars(appConfig: AppConfig): AppConfig {
  // appConfig.env = process.env.APP_ENV ?? appConfig.env;

  // process.env.APP_PORT != null
  //   ? parseInt(process.env.APP_PORT)
  //   : appConfig.port;
  // appConfig.host = process.env.APP_HOST ?? appConfig.host;

  // // @ts-expect-error
  // if (appConfig.cache == null) appConfig.cache = {};
  // appConfig.cache.ttl =
  //   process.env.CACHE_TTL != null
  //     ? parseInt(process.env.CACHE_TTL)
  //     : appConfig.cache.ttl;
  // appConfig.cache.enabled =
  //   process.env.CACHE_ENABLED != null
  //     ? process.env.CACHE_ENABLED === "true"
  //     : appConfig.cache.enabled;

  return appConfig;
}
