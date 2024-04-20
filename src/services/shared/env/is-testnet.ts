import { getEnv } from './get-env';

export function isTestnet(): boolean {
  const env = getEnv();

  return ['testnet'].includes(env);
}
