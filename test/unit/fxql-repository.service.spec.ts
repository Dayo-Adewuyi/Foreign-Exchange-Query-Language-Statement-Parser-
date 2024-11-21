import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { FxRateRepository } from '../../src/modules/fxql/repositories/fx-rate.repository';
import { FxRateEntity } from '../../src/core/domain/entities/fx-rate.entity';

describe('FxRateRepository Unit test', () => {
  let repository: FxRateRepository;
  let dataSource: DataSource;

  const mockDataSource = {
    createEntityManager: jest.fn(),
    transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FxRateRepository,
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    repository = module.get<FxRateRepository>(FxRateRepository);
    dataSource = module.get<DataSource>(DataSource);
  });

  describe('bulkCreate', () => {
    const testRate = {
      EntryId: 1,
      SourceCurrency: 'USD',
      DestinationCurrency: 'GBP',
      BuyPrice: 0.85,
      SellPrice: 0.9,
      CapAmount: 10000,
    };

    it('creates new rate if not exists', async () => {
      const savedEntity = {
        id: '1',
        sourceCurrency: testRate.SourceCurrency,
        destinationCurrency: testRate.DestinationCurrency,
        buyPrice: testRate.BuyPrice,
        sellPrice: testRate.SellPrice,
        capAmount: testRate.CapAmount,
      };

      const mockManager = {
        findOne: jest
          .fn()
          .mockResolvedValueOnce(null)
          .mockResolvedValueOnce(savedEntity),
        create: jest.fn().mockReturnValue(savedEntity),
        save: jest.fn().mockResolvedValue(savedEntity),
      };

      mockDataSource.transaction.mockImplementationOnce((cb) =>
        cb(mockManager),
      );

      const result = await repository.bulkCreate([testRate]);
      expect(result).toHaveLength(1);
      expect(mockManager.create).toHaveBeenCalledWith(
        FxRateEntity,
        expect.any(Object),
      );
      expect(mockManager.save).toHaveBeenCalled();
      expect(result[0].BuyPrice).toBe(testRate.BuyPrice);
    });

    it('updates existing rate', async () => {
      const existingRate = {
        id: '1',
        sourceCurrency: 'USD',
        destinationCurrency: 'GBP',
        buyPrice: 0.8,
        sellPrice: 0.85,
        capAmount: 8000,
      };

      const updatedRate = {
        ...existingRate,
        buyPrice: testRate.BuyPrice,
        sellPrice: testRate.SellPrice,
        capAmount: testRate.CapAmount,
      };

      const mockManager = {
        findOne: jest
          .fn()
          .mockResolvedValueOnce(existingRate)
          .mockResolvedValueOnce(updatedRate),
        save: jest.fn().mockResolvedValue(updatedRate),
      };

      mockDataSource.transaction.mockImplementationOnce((cb) =>
        cb(mockManager),
      );

      const result = await repository.bulkCreate([testRate]);
      expect(result).toHaveLength(1);
      expect(mockManager.save).toHaveBeenCalled();
      expect(result[0].BuyPrice).toBe(testRate.BuyPrice);
    });
  });
});
