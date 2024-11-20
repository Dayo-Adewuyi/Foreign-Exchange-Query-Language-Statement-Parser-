import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerModuleOptions } from '@nestjs/throttler';
import { APP_PIPE, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';

import configuration from './config/configuration';
import { TypeOrmConfigService } from './config/database/database.config';
import { FxqlModule } from './modules/fxql/fxql.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { ValidationPipe as CustomValidationPipe } from './common/pipes/validation.pipe';

@Module({
  imports: [
 
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration], 
      validationOptions: {
        allowUnknown: false, 
        abortEarly: true,  
      },
    }),

 
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService, 
    }),

 
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): ThrottlerModuleOptions => {
        const ttl = configService.get<number>('app.rateLimit.ttl', 60); 
        const limit = configService.get<number>('app.rateLimit.max', 10); 
    
        return {
          throttlers: [
            {
              ttl,     
              limit,  
            },
          ],
          skipIf: () => false, 
          errorMessage: 'Too many requests, please try again later.', 
        };
      },
    }),

 
    FxqlModule,
  ],

 
  providers: [
  
    {
      provide: APP_PIPE,
      useClass: CustomValidationPipe,
    },

   
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },

   
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
