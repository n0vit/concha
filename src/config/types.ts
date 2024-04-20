interface AppDatabaseConfig {
  database: string;
  user: string;
  password: string;
  host: string;
  port: number;
  ssl?: {
    rejectUnauthorized: boolean;
  };
  min?: number;
  max?: number;
}

interface AppRedisConfig {
  port: number;
  host: string;
  password: string;
}

export interface AppConfig {
  env: 'development' | 'production' | 'test' | 'testnet' | string; // APP_ENV
  port: number; // APP_PORT
  host: string; // APP_HOST
  cache: {
    ttl: number; // CACHE_TTL
    enabled: boolean; // CACHE_ENABLED
  };

  ethBeaconEndpoints: {
    mainnet: Array<{
      CL: string;
      EL: string;
    }>;
    holesky: Array<{
      CL: string;
      EL: string;
    }>;
  };

  db: { local: AppDatabaseConfig; allnodes: AppDatabaseConfig };

  redis: AppRedisConfig;
}
