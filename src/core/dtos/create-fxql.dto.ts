import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFxqlDto {
  @ApiProperty({
    description: 'FXQL statement string',
    example: 'USD-GBP {\n BUY 0.85\n SELL 0.90\n CAP 10000\n}',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(10000)
  FXQL: string;
}
