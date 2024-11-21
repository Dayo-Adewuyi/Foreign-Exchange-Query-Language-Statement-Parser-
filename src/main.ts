import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as compression from 'compression';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { setupSwagger } from './config/swagger/swagger.config';
import { CustomLogger } from './utils/logger.util';

async function bootstrap() {
  const logger = new CustomLogger();

  const app = await NestFactory.create(AppModule, {
    logger,
    cors: true,
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('app.port');

  app.use(helmet());
  app.use(compression());

  setupSwagger(app);

  await app.listen(port);
  logger.log(`Application is running on: http://localhost:${port}`);
  logger.log(`Swagger documentation: http://localhost:${port}/api/docs`);
}

bootstrap().catch((error) => {
  Logger.error('Application failed to start:', error);
  process.exit(1);
});
