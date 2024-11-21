export const VALID_CURRENCIES = [
  'USD',
  'GBP',
  'EUR',
  'JPY',
  'NGN',
  'KES',
] as const;
export type ValidCurrency = (typeof VALID_CURRENCIES)[number];

export const FXQL_REGEX = {
  CURRENCY_PAIR: /^([A-Z]{3})-([A-Z]{3})\s*\{$/,
  BUY: /^BUY\s+(\d*\.?\d+)$/,
  SELL: /^SELL\s+(\d*\.?\d+)$/,
  CAP: /^CAP\s+(\d+)$/,
  CLOSING_BRACE: /^\s*}\s*$/,
} as const;

export const ERROR_CODES = {
  INVALID_SYNTAX: 'FXQL-400',
  INVALID_CURRENCY: 'FXQL-405',
  INVALID_AMOUNT: 'FXQL-408',
  INVALID_CAP: 'FXQL-407',
  RATE_LIMIT_EXCEEDED: 'FXQL-429',
  SERVER_ERROR: 'FXQL-500',
} as const;
