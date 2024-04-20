import { getEnv } from './get-env';

export function isProductionOrTestnet(): boolean {
  const env = getEnv();

  return ['production', 'testnet'].includes(env);
}
