import { Controller, Post, Body, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { FxqlParserService } from '../services/fxql-parser.service';
import { CreateFxqlDto } from '../../../core/dtos/create-fxql.dto';
import { FxqlResponseDto } from '../../../core/dtos/response-fxql.dto';
import { RateLimiterGuard } from '../../../common/guards/rate-limiter.guard';
import { TransformInterceptor } from '../../../common/interceptors/transform.interceptor';
import { LoggingInterceptor } from '../../../common/interceptors/logging.interceptor';

@ApiTags('fxql')
@Controller('fxql-statements')
@UseGuards(RateLimiterGuard)
@UseInterceptors(LoggingInterceptor, TransformInterceptor)
export class FxqlController {
  constructor(private readonly fxqlParserService: FxqlParserService) {}

  @Post()
  @ApiOperation({ summary: 'Parse FXQL statement' })
  @ApiResponse({ status: 200, type: FxqlResponseDto, isArray: true })
  async parseFxql(@Body() createFxqlDto: CreateFxqlDto) {
    return this.fxqlParserService.parse(createFxqlDto.FXQL);
  }
}