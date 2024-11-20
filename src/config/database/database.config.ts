import { Injectable } from '@nestjs/common';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    const dbConfig = this.configService.get('app.database');

    return {
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
      cache: {
        type: 'ioredis',
        duration: 60000, 
        ignoreErrors: true,
      },
    };
  }
}
