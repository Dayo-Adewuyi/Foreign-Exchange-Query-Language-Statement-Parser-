import { Injectable } from '@nestjs/common';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    const dbConfig = this.configService.get('app.database');
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

    const redis = new Redis(redisUrl, {
      retryStrategy(times) {
        if (times > 3) {
          console.warn('Redis connection failed, disabling cache');
          return null;
        }
        return Math.min(times * 500, 2000);
      },
      maxRetriesPerRequest: 3,
    });

    redis.on('error', (error) => {
      console.warn('Redis error, disabling cache:', error.message);
      redis.disconnect();
    });

    const baseConfig: TypeOrmModuleOptions = {
      type: 'postgres',
      host: dbConfig.host,
      port: dbConfig.port,
      username: dbConfig.username,
      password: dbConfig.password,
      database: dbConfig.database,
      entities: ['dist/**/*.entity{.ts,.js}'],
      migrations: ['dist/database/migrations/*{.ts,.js}'],
      synchronize: dbConfig.synchronize,
      logging: dbConfig.logging,
      ssl: dbConfig.sslEnabled ? { rejectUnauthorized: false } : false,
      poolSize: dbConfig.maxConnections,
      extra: {
        max: dbConfig.maxConnections,
        poolSize: dbConfig.maxConnections,
      },
    };
    if (process.env.REDIS_URL) {
      return {
        ...baseConfig,
        cache: {
          type: 'ioredis',
          options: redis,
          duration: 60000,
          ignoreErrors: true,
        },
      };
    }

    return baseConfig;
  }
}