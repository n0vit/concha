import { getEnv } from './get-env';

export function isTestOrDevelopment(): boolean {
  const env = getEnv();

  return ['development', 'test'].includes(env);
}
