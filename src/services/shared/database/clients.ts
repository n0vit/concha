import pg from 'pg';
import { appConfig } from '@/config';
import Bluebird from 'bluebird';
export const allnodesClient = new pg.Pool(appConfig.db.allnodes);

const poolOptions = Object.assign(
  {},
  {
    ...appConfig.db.local,
    host: process.env.DB_HOST ? process.env.DB_HOST : appConfig.db.local.host,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : appConfig.db.local.port
  },
  { Promise: Bluebird, idleTimeoutMillis: 10_000 }
);

console.log(`[db] using port = "${poolOptions.port}"`);
export const localClient = new pg.Pool(poolOptions);
