import { Test, TestingModule } from '@nestjs/testing';
import { FxqlParserService } from '../../src/modules/fxql/services/fxql-parser.service';
import { FxqlValidatorService } from '../../src/modules/fxql/services/fxql-validator.service';
import { FxRateRepository } from '../../src/modules/fxql/repositories/fx-rate.repository';
import { InvalidSyntaxError, InvalidCurrencyError, RateLimitExceededError } from '../../src/core/errors/fxql-errors';

describe('FxqlParserService Unit Test', () => {
  let service: FxqlParserService;
  let repository: FxRateRepository;

  const mockRepository = {
    bulkCreate: jest.fn()
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FxqlParserService,
        FxqlValidatorService,
        { provide: FxRateRepository, useValue: mockRepository }
      ],
    }).compile();

    service = module.get<FxqlParserService>(FxqlParserService);
    repository = module.get<FxRateRepository>(FxRateRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('parse', () => {
    const validFxql = `USD-GBP {
      BUY 0.85
      SELL 0.90
      CAP 10000
    }`;

    it('parses valid FXQL', async () => {
      mockRepository.bulkCreate.mockResolvedValueOnce([{
        EntryId: 1,
        SourceCurrency: 'USD',
        DestinationCurrency: 'GBP',
        BuyPrice: 0.85,
        SellPrice: 0.90,
        CapAmount: 10000
      }]);

      const result = await service.parse(validFxql);
      expect(result).toHaveLength(1);
      expect(result[0].BuyPrice).toBe(0.85);
    });

    const errorCases = [
      {
        name: 'invalid currency case',
        input: 'usd-GBP { BUY 0.85 SELL 0.90 CAP 10000 }',
        error: InvalidCurrencyError,
        pattern: "Invalid currency pair format: \"usd-GBP { BUY 0.85 SELL 0.90 CAP 10000 }\""
      },
      {
        name: 'missing fields',
        input: 'USD-GBP { BUY 0.85 SELL 0.90 }',
        error: InvalidCurrencyError,
        pattern: "Invalid currency pair format: \"USD-GBP { BUY 0.85 SELL 0.90 }\""
      },
      {
        name: 'empty statement',
        input: '',
        error: InvalidSyntaxError,
        pattern: "No FXQL statements found"
      }
    ];

    errorCases.forEach(({ name, input, error, pattern }) => {
      it(`throws on ${name}`, async () => {
        await expect(service.parse(input))
          .rejects.toThrow(error);
        await expect(service.parse(input))
          .rejects.toThrow(pattern);
      });
    });

    it('throws on exceeding rate limit', async () => {
      const pairs = Array(1001).fill(validFxql).join('\n\n');
      await expect(service.parse(pairs))
        .rejects.toThrow(InvalidSyntaxError);
    });
  });
});