import { registerAs } from '@nestjs/config';

export default registerAs('app', () => {
  const isTestEnv = process.env.NODE_ENV === 'test';
  return {
    nodeEnv: process.env.NODE_ENV,
    port: parseInt(process.env.PORT, 10),
    database: {
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10),
      username: isTestEnv
        ? process.env.TEST_DB_USERNAME
        : process.env.DB_USERNAME ,
      password: isTestEnv
        ? process.env.TEST_DB_PASSWORD
        : process.env.DB_PASSWORD,
      database: isTestEnv
        ? process.env.TEST_DB_NAME
        : process.env.DB_NAME,
      schema: process.env.DB_SCHEMA,
      synchronize: isTestEnv || process.env.DB_SYNC,
      logging: process.env.DB_LOGGING,
      maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS, 10),
      sslEnabled: process.env.DB_SSL_ENABLED,
    },
    cache: {
      ttl: parseInt(process.env.CACHE_TTL, 10),
      max: parseInt(process.env.CACHE_MAX_ITEMS, 10),
    },
    rateLimit: {
      ttl: parseInt(process.env.RATE_LIMIT_TTL, 10),
      max: parseInt(process.env.RATE_LIMIT_MAX, 10),
    },
  };
});
