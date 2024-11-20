import { ApiProperty } from '@nestjs/swagger';
import { IFxRate } from '../domain/interfaces/fx-rate.interface';

export class FxqlResponseDto implements IFxRate {
  @ApiProperty()
  EntryId: number;

  @ApiProperty()
  SourceCurrency: string;

  @ApiProperty()
  DestinationCurrency: string;

  @ApiProperty()
  SellPrice: number;

  @ApiProperty()
  BuyPrice: number;

  @ApiProperty()
  CapAmount: number;
}
