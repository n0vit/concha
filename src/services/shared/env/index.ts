import { getEnv } from "./get-env";
import { isDevelopment } from "./is-development";
import { isProduction } from "./is-production";
import { isProductionOrTestnet } from "./is-production-or-testnet";
import { isTestOrDevelopment } from "./is-test-or-development";
import { isTestnet } from "./is-testnet";

const EnvService = {
  getEnv,
  isDevelopment,
  isProduction,
  isProductionOrTestnet,
  isTestOrDevelopment,
  isTestnet,
};

export default EnvService;

export * from "./get-env";
export * from "./is-development";
export * from "./is-production";
export * from "./is-production-or-testnet";
export * from "./is-test-or-development";
export * from "./is-testnet";
