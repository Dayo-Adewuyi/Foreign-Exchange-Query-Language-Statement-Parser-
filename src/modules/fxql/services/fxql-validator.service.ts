import { Injectable } from '@nestjs/common';
import { VALID_CURRENCIES } from '../../../common/constants/currency.constants';
import {  InvalidAmountError, InvalidCapError, InvalidCurrencyError } from '../../../core/errors/fxql-errors';

@Injectable()
export class FxqlValidatorService {
  async validateCurrencyPair(source: string, destination: string, line: number, column: number): Promise<void> {
    if (!source || source !== source.toUpperCase()) {
      throw new InvalidCurrencyError(`Invalid currency case: '${source}' should be '${source.toUpperCase()}'`, line, column);
    }
    
    if (!VALID_CURRENCIES.includes(source as any) || !VALID_CURRENCIES.includes(destination as any)) {
      throw new InvalidCurrencyError(`Invalid currency pair: ${source}-${destination}`, line, column);
    }
  }

  async validateAmount(amount: number, value: string, line: number, column: number): Promise<void> {
    if (isNaN(amount)) {
      throw new InvalidAmountError(`Invalid amount: '${value}' is not a valid numeric amount`, line, column);
    }
    if (amount <= 0) {
      throw new InvalidAmountError(`Invalid amount: ${amount} must be greater than 0`, line, column);
    }
  }

  async validateCap(cap: number, line: number, column: number): Promise<void> {
    if (!Number.isInteger(cap) || cap < 0) {
      throw new InvalidCapError(`Invalid cap: ${cap}  shop be a positive number`, line, column);
    }
  }
}