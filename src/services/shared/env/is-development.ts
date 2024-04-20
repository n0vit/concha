import { getEnv } from './get-env';

export function isDevelopment(): boolean {
  const env = getEnv();

  return env === 'development';
}
