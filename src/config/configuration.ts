import { registerAs } from '@nestjs/config';

export default registerAs('app', () => {
  const isTestEnv = process.env.NODE_ENV === 'test';
  return {
  nodeEnv: process.env.NODE_ENV ,
  port: parseInt(process.env.PORT, 10),
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: isTestEnv ? process.env.TEST_DB_USERNAME : process.env.DB_USERNAME || 'postgres',
    password: isTestEnv ? process.env.TEST_DB_PASSWORD : process.env.DB_PASSWORD || '1234',
    database: isTestEnv ? process.env.TEST_DB_NAME : process.env.DB_NAME || 'fxql_db',
    schema: process.env.DB_SCHEMA || 'public',
    synchronize: isTestEnv||process.env.DB_SYNC === 'true',
    logging: process.env.DB_LOGGING === 'true',
    maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || '100', 10),
    sslEnabled: process.env.DB_SSL_ENABLED === 'true',
  },
  cache: {
    ttl: parseInt(process.env.CACHE_TTL || '300', 10),
    max: parseInt(process.env.CACHE_MAX_ITEMS || '1000', 10),
  },
  rateLimit: {
    ttl: parseInt(process.env.RATE_LIMIT_TTL || '60', 10),
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  },
}
}
);