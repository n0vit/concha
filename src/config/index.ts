import { appConfig } from "./config";
import { getConfig } from "./get-config";

const ConfigService = {
  getConfig,
  appConfig,
};

export default ConfigService;

export * from "./config";
export * from "./get-config";
export * from "./read-config";
export * from "./types";
