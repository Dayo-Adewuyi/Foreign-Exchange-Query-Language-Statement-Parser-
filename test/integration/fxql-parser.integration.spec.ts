import { Test } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { FxqlParserService } from '../../src/modules/fxql/services/fxql-parser.service';
import { FxqlValidatorService } from '../../src/modules/fxql/services/fxql-validator.service';
import { FxRateRepository } from '../../src/modules/fxql/repositories/fx-rate.repository';
import {
  InvalidSyntaxError,
  InvalidCurrencyError,
} from '../../src/core/errors/fxql-errors';

describe('FxqlParser Integration', () => {
  let parserService: FxqlParserService;
  let dataSource: DataSource;
  let repository: FxRateRepository;

  const createMockManager = (customFindOne = null) => ({
    findOne:
      customFindOne ||
      jest.fn().mockImplementation((_, query) => {
        if (query.where.sourceCurrency) {
          return Promise.resolve(null);
        }
        return Promise.resolve({
          id: 'test-id',
          sourceCurrency: query.where?.sourceCurrency || 'USD',
          destinationCurrency: query.where?.destinationCurrency || 'EUR',
          buyPrice: 0.85,
          sellPrice: 0.9,
          capAmount: 10000,
        });
      }),
    create: jest.fn().mockImplementation((_, data) => ({
      id: 'test-id',
      ...data,
    })),
    save: jest.fn().mockImplementation((entity) => ({
      id: 'test-id',
      ...entity,
    })),
  });

  const mockDataSource = {
    createEntityManager: jest.fn(),
    getRepository: jest.fn(),
    transaction: jest.fn((cb) => cb(createMockManager())),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        FxqlParserService,
        FxqlValidatorService,
        FxRateRepository,
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    parserService = module.get<FxqlParserService>(FxqlParserService);
    dataSource = module.get<DataSource>(DataSource);
    repository = module.get<FxRateRepository>(FxRateRepository);

    jest.clearAllMocks();
  });

  describe('Basic FXQL Parsing', () => {
    it('should throw an error when invalid currency pair format is provided', async () => {
      const fxql = `
        usd-EUR {
          BUY 0.85
          SELL 0.90
          CAP 10000
        }
      `;

      await expect(parserService.parse(fxql)).rejects.toThrow(
        InvalidCurrencyError,
      );
    });
  });

  describe('Error Handling', () => {
    it('should throw InvalidSyntaxError for missing required fields', async () => {
      const fxql = `
        USD-EUR {
          BUY 0.85
          SELL 0.90
        }
      `;

      await expect(parserService.parse(fxql)).rejects.toThrow(
        InvalidSyntaxError,
      );
    });

    it('should throw InvalidCurrencyError for invalid currency pairs', async () => {
      const fxql = `
        USD-XXX {
          BUY 0.85
          SELL 0.90
          CAP 10000
        }
      `;

      await expect(parserService.parse(fxql)).rejects.toThrow(
        InvalidCurrencyError,
      );
    });

    it('should throw error when exceeding maximum pairs limit', async () => {
      const pairTemplate = `
        USD-EUR {
          BUY 0.85
          SELL 0.90
          CAP 10000
        }
      `;
      const pairs = Array(1001).fill(pairTemplate).join('\n\n');

      await expect(parserService.parse(pairs)).rejects.toThrow(
        /Request exceeds maximum limit/,
      );
    });
  });

  describe('Format Handling', () => {
    it('should handle various number formats', async () => {
      const fxql = `
        USD-EUR {
          BUY 0.85000
          SELL 0.90000
          CAP 10000
        }
      `;

      let findOneCallCount = 0;
      const mockManager = createMockManager(
        jest.fn().mockImplementation(() => {
          findOneCallCount++;
          if (findOneCallCount === 1) return null;
          return {
            id: 'test-id',
            sourceCurrency: 'USD',
            destinationCurrency: 'EUR',
            buyPrice: 0.85,
            sellPrice: 0.9,
            capAmount: 10000,
          };
        }),
      );

      mockDataSource.transaction.mockImplementationOnce((cb) =>
        cb(mockManager),
      );

      const result = await parserService.parse(fxql);
      expect(result[0].BuyPrice).toBe(0.85);
      expect(result[0].SellPrice).toBe(0.9);
    });

    it('should handle Windows-style line endings', async () => {
      const fxql = 'USD-EUR {\r\nBUY 0.85\r\nSELL 0.90\r\nCAP 10000\r\n}';

      let findOneCallCount = 0;
      const mockManager = createMockManager(
        jest.fn().mockImplementation(() => {
          findOneCallCount++;
          if (findOneCallCount === 1) return null;
          return {
            id: 'test-id',
            sourceCurrency: 'USD',
            destinationCurrency: 'EUR',
            buyPrice: 0.85,
            sellPrice: 0.9,
            capAmount: 10000,
          };
        }),
      );

      mockDataSource.transaction.mockImplementationOnce((cb) =>
        cb(mockManager),
      );

      const result = await parserService.parse(fxql);
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        SourceCurrency: 'USD',
        DestinationCurrency: 'EUR',
      });
    });
  });

  describe('Validation Rules', () => {
    it('should reject negative values', async () => {
      const fxql = `
        USD-EUR {
          BUY -0.85
          SELL 0.90
          CAP 10000
        }
      `;

      await expect(parserService.parse(fxql)).rejects.toThrow(
        InvalidSyntaxError,
      );
    });

    it('should allow zero CAP values', async () => {
      const fxql = `
        USD-EUR {
          BUY 0.85
          SELL 0.90
          CAP 0
        }
      `;

      await expect(parserService.parse(fxql)).resolves.toBeDefined();
    });

    it('should handle multiple whitespace between currency pair', async () => {
      const fxql = `USD-EUR    {
        BUY 0.85
        SELL 0.90
        CAP 10000
      }`;

      await expect(parserService.parse(fxql)).resolves.toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty input', async () => {
      await expect(parserService.parse('')).rejects.toThrow(InvalidSyntaxError);
    });

    it('should handle input with only whitespace', async () => {
      await expect(parserService.parse('   \n   \t   ')).rejects.toThrow(
        InvalidSyntaxError,
      );
    });

    it('should store latest record in a duplicate currency pairs', async () => {
      const fxql = `
        USD-EUR {
          BUY 0.85
          SELL 0.90
          CAP 10000
        }

        USD-EUR {
          BUY 0.86
          SELL 0.91
          CAP 11000
        }
      `;

      let findOneCallCount = 0;
      const mockManager = createMockManager(
        jest.fn().mockImplementation(() => {
          findOneCallCount++;
          if (findOneCallCount === 1) return null;
          return {
            id: 'test-id',
            sourceCurrency: 'USD',
            destinationCurrency: 'EUR',
            buyPrice: 0.86,
            sellPrice: 0.91,
            capAmount: 11000,
          };
        }),
      );

      mockDataSource.transaction.mockImplementationOnce((cb) =>
        cb(mockManager),
      );

      const result = await parserService.parse(fxql);
      expect(result).toHaveLength(1);
      expect(result[0].BuyPrice).toBe(0.86);
      expect(result[0].SellPrice).toBe(0.91);
    });
  });
});
