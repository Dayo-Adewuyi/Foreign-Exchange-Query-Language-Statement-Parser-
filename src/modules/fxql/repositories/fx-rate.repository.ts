import { Injectable } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { FxRateEntity } from '../../../core/domain/entities/fx-rate.entity';
import { IFxRate } from '../../../core/domain/interfaces/fx-rate.interface';
import { ValidCurrency } from 'src/common/constants/currency.constants';

@Injectable()
export class FxRateRepository extends Repository<FxRateEntity> {
  constructor(private dataSource: DataSource) {
    super(FxRateEntity, dataSource.createEntityManager());
  }

  async bulkCreate(rates: IFxRate[]): Promise<IFxRate[]> {
    const latestRates = new Map<string, IFxRate>();
    
    rates.forEach((rate, index) => {
      const key = `${rate.SourceCurrency}-${rate.DestinationCurrency}`;
      latestRates.set(key, {
        ...rate,
        EntryId: index + 1  
      });
    });

    const results: IFxRate[] = [];
    
    await this.dataSource.transaction(async manager => {
      for (const rate of latestRates.values()) {
        const existingRate = await manager.findOne(FxRateEntity, {
          where: {
            sourceCurrency: rate.SourceCurrency as ValidCurrency,
            destinationCurrency: rate.DestinationCurrency as ValidCurrency,
          },
        });

        let savedEntity: FxRateEntity;

        if (existingRate) {
          existingRate.buyPrice = rate.BuyPrice;
          existingRate.sellPrice = rate.SellPrice;
          existingRate.capAmount = rate.CapAmount;
          savedEntity = await manager.save(existingRate);
        } else {
          const entity = manager.create(FxRateEntity, {
            sourceCurrency: rate.SourceCurrency as ValidCurrency,
            destinationCurrency: rate.DestinationCurrency as ValidCurrency,
            buyPrice: rate.BuyPrice,
            sellPrice: rate.SellPrice,
            capAmount: rate.CapAmount,
          });
          savedEntity = await manager.save(entity);
        }

        const freshEntity = await manager.findOne(FxRateEntity, {
          where: { id: savedEntity.id }
        });

        if (!freshEntity) {
          throw new Error('Failed to save/retrieve entity');
        }

        results.push({
          EntryId: rate.EntryId,  
          SourceCurrency: freshEntity.sourceCurrency,
          DestinationCurrency: freshEntity.destinationCurrency,
          BuyPrice: parseFloat(freshEntity.buyPrice.toString()),
          SellPrice: parseFloat(freshEntity.sellPrice.toString()),
          CapAmount: parseInt(freshEntity.capAmount.toString(), 10),
        });
      }
    });

    return results.sort((a, b) => (a.EntryId || 0) - (b.EntryId || 0));
  }
}