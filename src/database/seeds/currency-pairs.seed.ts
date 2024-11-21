import { DataSource, DeepPartial } from 'typeorm';
import { FxRateEntity } from '../../core/domain/entities/fx-rate.entity';
import { Seeder } from 'typeorm-extension';

export default class CurrencyPairsSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<void> {
    const repository = dataSource.getRepository(FxRateEntity);

    const currencyPairs = [
      {
        sourceCurrency: 'USD',
        destinationCurrency: 'GBP',
        buyPrice: 0.85,
        sellPrice: 0.9,
        capAmount: 10000,
      },
      {
        sourceCurrency: 'EUR',
        destinationCurrency: 'USD',
        buyPrice: 1.05,
        sellPrice: 1.1,
        capAmount: 15000,
      },
      {
        sourceCurrency: 'GBP',
        destinationCurrency: 'EUR',
        buyPrice: 1.15,
        sellPrice: 1.2,
        capAmount: 12000,
      },
      {
        sourceCurrency: 'JPY',
        destinationCurrency: 'USD',
        buyPrice: 0.0067,
        sellPrice: 0.007,
        capAmount: 1000000,
      },
      {
        sourceCurrency: 'EUR',
        destinationCurrency: 'GBP',
        buyPrice: 0.85,
        sellPrice: 0.88,
        capAmount: 20000,
      },
    ];

    const existingCount = await repository.count();
    if (existingCount === 0) {
      await repository.save(currencyPairs as DeepPartial<FxRateEntity>[]);
      console.log('✅ Currency pairs seeded successfully');
    } else {
      console.log('ℹ️ Seed data already exists');
    }
  }
}
