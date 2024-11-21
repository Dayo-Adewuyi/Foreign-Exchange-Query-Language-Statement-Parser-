import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FxqlController } from './controllers/fxql.controller';
import { FxqlParserService } from './services/fxql-parser.service';
import { FxqlValidatorService } from './services/fxql-validator.service';
import { FxRateRepository } from './repositories/fx-rate.repository';
import { FxRateEntity } from '../../core/domain/entities/fx-rate.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FxRateEntity])],
  controllers: [FxqlController],
  providers: [FxqlParserService, FxqlValidatorService, FxRateRepository],
  exports: [FxqlParserService],
})
export class FxqlModule {}
