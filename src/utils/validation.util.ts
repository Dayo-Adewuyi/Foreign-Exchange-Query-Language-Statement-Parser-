import { ValidatorOptions, validate } from 'class-validator';
import { ClassConstructor, plainToClass } from 'class-transformer';

export class ValidationUtil {
  private static readonly defaultValidatorOptions: ValidatorOptions = {
    whitelist: true,
    forbidNonWhitelisted: true,
    forbidUnknownValues: true,
    validationError: {
      target: false,
    },
  };

  static async validateDTO<T extends object>(
    dto: ClassConstructor<T>,
    plain: Record<string, any>,
    options: ValidatorOptions = ValidationUtil.defaultValidatorOptions
  ): Promise<[T, string[]]> {
    const instance = plainToClass(dto, plain);
    const errors = await validate(instance, options);

    if (errors.length > 0) {
      const messages = errors.map(error => 
        Object.values(error.constraints || {}).join(', ')
      );
      return [instance, messages];
    }

    return [instance, []];
  }

  static isValidNumber(value: any): boolean {
    if (typeof value !== 'number' && typeof value !== 'string') {
      return false;
    }
    const num = Number(value);
    return !isNaN(num) && isFinite(num) && num >= 0;
  }

  static isValidCurrencyPair(sourceCurrency: string, destinationCurrency: string): boolean {
    const currencyRegex = /^[A-Z]{3}$/;
    return (
      currencyRegex.test(sourceCurrency) &&
      currencyRegex.test(destinationCurrency) &&
      sourceCurrency !== destinationCurrency
    );
  }
}