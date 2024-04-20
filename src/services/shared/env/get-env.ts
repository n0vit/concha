import { appConfig as config } from "@/config";

type Env = "development" | "production" | "testnet" | "test";

export function getEnv(): Env {
  return config.env as Env;
}
