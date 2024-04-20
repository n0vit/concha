import Bluebird from 'bluebird';
import postgres, { Pool } from 'pg';

import { localClient } from './clients';
import { logger } from '@/utils';

let pg = postgres;

if (pg.native) {
  pg = pg.native;
}

pg.types.setTypeParser(20, (value: any) => {
  const result = Number(value);

  return result > Number.MAX_SAFE_INTEGER ? String(value) : result;
});

const pool = localClient;

// const debug = new Debug();

// debug.setModule("DATABASE");

async function tx(queries: Function[]) {
  await Bluebird.each(queries, (query: any) => query());
}

function query<T = unknown, Full = false>(
  config: string,
  values: Array<any> = [],
  client: Pool | null = null
): Promise<{
  rows: Full extends false ? Array<Partial<T>> : Array<T>;
  rowCount: number;
}> {
  if (client) {
    return new Promise((resolve, reject) => {
      client.query(config, values as any, (err: any, result: any) => {
        if (err) {
          logger.error(`ERROR ${err}. Query: ${config}`);

          return reject(err);
        }

        resolve(result);
      });
    });
  }
  return new Promise((resolve, reject) => {
    pool.query(config, values as any, (err: any, result: any) => {
      if (err) {
        logger.error(`ERROR ${err}. Query: ${config}`);

        return reject(err);
      }

      resolve(result);
    });
  });
}

export { tx };
export { query as exec };
export { query };
export { pool };
