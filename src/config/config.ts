import { getConfig } from "./get-config";
import { AppConfig } from "./types";

export const appConfig: AppConfig = getConfig<AppConfig>(
  (appConfig) => appConfig
);
