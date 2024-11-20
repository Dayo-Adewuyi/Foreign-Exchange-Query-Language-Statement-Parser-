import { Test, TestingModule } from '@nestjs/testing';
import { FxqlValidatorService } from '../../src/modules/fxql/services/fxql-validator.service';
import { InvalidCurrencyError, InvalidAmountError, InvalidCapError } from '../../src/core/errors/fxql-errors';

describe('FxqlValidatorService Unit Test', () => {
  let service: FxqlValidatorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FxqlValidatorService],
    }).compile();

    service = module.get<FxqlValidatorService>(FxqlValidatorService);
  });

  describe('validateCurrencyPair', () => {
    it('validates correct currency pairs', async () => {
      await expect(service.validateCurrencyPair('USD', 'GBP', 1, 1))
        .resolves.not.toThrow();
    });

    it('throws on invalid currency case', async () => {
      await expect(service.validateCurrencyPair('usd', 'GBP', 1, 1))
        .rejects.toThrow(/Invalid currency case/);
    });

    it('throws on invalid currency code', async () => {
      await expect(service.validateCurrencyPair('XYZ', 'GBP', 1, 1))
        .rejects.toThrow(InvalidCurrencyError);
    });
  });

  describe('validateAmount', () => {
    const testCases = [
      { value: 100, str: '100', shouldPass: true },
      { value: 0, str: '0', shouldPass: false },
      { value: -100, str: '-100', shouldPass: false },
      { value: NaN, str: 'abc', shouldPass: false },
    ];

    testCases.forEach(({ value, str, shouldPass }) => {
      it(`${shouldPass ? 'validates' : 'throws on'} amount: ${str}`, async () => {
        const validation = service.validateAmount(value, str, 1, 1);
        if (shouldPass) {
          await expect(validation).resolves.not.toThrow();
        } else {
          await expect(validation).rejects.toThrow(InvalidAmountError);
        }
      });
    });
  });

  describe('validateCap', () => {
    const testCases = [
      { value: 1000, shouldPass: true },
      { value: 0, shouldPass: true },
      { value: -1000, shouldPass: false },
      { value: 1.5, shouldPass: false },
    ];

    testCases.forEach(({ value, shouldPass }) => {
      it(`${shouldPass ? 'validates' : 'throws on'} cap: ${value}`, async () => {
        const validation = service.validateCap(value, 1, 1);
        if (shouldPass) {
          await expect(validation).resolves.not.toThrow();
        } else {
          await expect(validation).rejects.toThrow(InvalidCapError);
        }
      });
    });
  });
});