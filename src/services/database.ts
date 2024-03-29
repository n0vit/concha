import Bluebird from "bluebird";
import postgres from "pg";
import { appConfig as config } from "../config";
import { logger } from "@/utils";

let pg = postgres;

if (pg.native) {
  pg = pg.native;
}

pg.types.setTypeParser(20, (value: any) => {
  const result = Number(value);

  return result > Number.MAX_SAFE_INTEGER ? String(value) : result;
});

const poolOptions = Object.assign(
  {},
  {
    ...config.db,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : config.db.port,
  },
  { Promise: Bluebird, idleTimeoutMillis: 10_000 }
);

console.log(`[db] using port = "${poolOptions.port}"`);

const pool = new pg.Pool(poolOptions);
// const debug = new Debug();

// debug.setModule("DATABASE");

async function tx(queries: Function[]) {
  await Bluebird.each(queries, (query: any) => query());
}

function query<T = unknown, Full = false>(
  config: string,
  values: Array<unknown> | null = null,
  client: any = null
): Promise<{
  rows: Full extends false ? Array<Partial<T>> : Array<T>;
  rowCount: number;
}> {
  if (client) {
    return new Promise((resolve, reject) => {
      client.query(config, values, (err: any, result: any) => {
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
