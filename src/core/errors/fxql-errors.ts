import { ERROR_CODES } from '../../common/constants/currency.constants';

export class FxqlError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly position?: {
      line: number;
      column: number;
    }
  ) {
    super(message);
    this.name = 'FxqlError';
  }
}

export class InvalidSyntaxError extends FxqlError {
  constructor(message: string, line?: number, column?: number) {
    super(
      message, 
      ERROR_CODES.INVALID_SYNTAX,
      line && column ? { line, column } : undefined
    );
  }
}

export class InvalidCurrencyError extends FxqlError {
  constructor(message: string, line?: number, column?: number) {
    super(
      message, 
      ERROR_CODES.INVALID_CURRENCY,
      line && column ? { line, column } : undefined
    );
  }
}

export class InvalidAmountError extends FxqlError {
  constructor(message: string, line?: number, column?: number) {
    super(
      message, 
      ERROR_CODES.INVALID_AMOUNT,
      line && column ? { line, column } : undefined
    );
  }
}

export class InvalidCapError extends FxqlError {
  constructor(message: string, line?: number, column?: number) {
    super(
      message, 
      ERROR_CODES.INVALID_CAP,
      line && column ? { line, column } : undefined
    );
  }
}

export class RateLimitExceededError extends FxqlError {
  constructor(message: string) {
    super(message, ERROR_CODES.RATE_LIMIT_EXCEEDED);
  }
}