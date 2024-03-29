import { readConfig } from "./read-config";
import { AppConfig } from "./types";

export function getConfig<T>(
  selector: (appConfig: AppConfig) => T,
  defaultValue?: T | null
): T {
  const appConfig = readConfig();

  try {
    return selector(appConfig);
  } catch (err) {
    if (defaultValue !== undefined) {
      return defaultValue as unknown as T;
    }

    throw err;
  }
}
