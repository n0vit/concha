import { getEnv } from './get-env';

export function isProduction(): boolean {
  const env = getEnv();

  return env === 'production';
}
