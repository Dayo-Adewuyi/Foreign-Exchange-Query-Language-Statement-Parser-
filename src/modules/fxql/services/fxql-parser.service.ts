import { Injectable } from '@nestjs/common';
import { FxRateRepository } from '../repositories/fx-rate.repository';
import { FxqlValidatorService } from './fxql-validator.service';
import { IFxRate } from '../../../core/domain/interfaces/fx-rate.interface';
import { InvalidSyntaxError , InvalidCurrencyError} from '../../../core/errors/fxql-errors';
import { FXQL_REGEX } from '../../../common/constants/currency.constants';

@Injectable()
export class FxqlParserService {
    private readonly MAX_PAIRS = 1000;

  constructor(
    private readonly fxRateRepository: FxRateRepository,
    private readonly validatorService: FxqlValidatorService,
  ) {}

  async parse(fxqlString: string): Promise<IFxRate[]> {
    const cleanedFxql = fxqlString
      .replace(/\\n/g, '\n')
      .replace(/\r\n/g, '\n')
      .trim();

    const statements = this.splitStatements(cleanedFxql);
    if (statements.length > this.MAX_PAIRS) {
        throw new InvalidSyntaxError(
          `Request exceeds maximum limit of ${this.MAX_PAIRS} currency pairs`,
          1,
          1
        );
      } else if (statements.length === 0) {
        throw new InvalidSyntaxError('No FXQL statements found', 1, 1);
      }

      
    const parsedRates: IFxRate[] = [];

    for (const [index, statement] of statements.entries()) {
      try {
        const parsedRate = await this.parseStatement(statement, index + 1);
        parsedRates.push(parsedRate);
      } catch (error) {
        if (error instanceof InvalidSyntaxError) {
          throw new InvalidSyntaxError(
            `${error.message} at statement ${index + 1}`, 
            index + 1
          );
        }
        throw error;
      }
    }

    return this.fxRateRepository.bulkCreate(parsedRates);
  }

  private splitStatements(fxqlString: string): string[] {
    return fxqlString
      .split(/}\s*\n\s*\n/)
      .map(stmt => stmt.trim())
      .filter(Boolean)
      .map(stmt => stmt.endsWith('}') ? stmt : `${stmt}}`);
  }

  private async parseStatement(statement: string, lineNumber: number): Promise<IFxRate> {
    const lines = statement
      .split('\n')
      .map(line => line.trim())
      .filter(line => line !== '');  
    
      
    const firstLine = lines[0];
    const currencyPairMatch = FXQL_REGEX.CURRENCY_PAIR.exec(firstLine);

    if (!currencyPairMatch) {
        throw new InvalidCurrencyError(
          `Invalid currency pair format: "${firstLine}"`,
          lineNumber,
          1
        );
      }
    
      const [, sourceCurrency, destinationCurrency] = currencyPairMatch;
      await this.validatorService.validateCurrencyPair(
        sourceCurrency, 
        destinationCurrency,
        lineNumber,
        firstLine.indexOf(sourceCurrency)
      );

      if (!firstLine.match(/[A-Z]{3}-[A-Z]{3}\s+{/)) {
        throw new InvalidSyntaxError(
          `Missing single space after currency pair ${sourceCurrency}-${destinationCurrency}`,
          lineNumber,
          firstLine.indexOf('{')
        );
      }

    const rate: Partial<IFxRate> = {
      SourceCurrency: sourceCurrency,
      DestinationCurrency: destinationCurrency,
    };

    const contentLines = lines
      .slice(1)
      .map(line => line.replace(/}$/, '').trim())
      .filter(line => line !== '');

    await this.processLines(contentLines, rate, lineNumber);

    const missingFields = [];
    if (rate.BuyPrice === undefined) missingFields.push('BUY');
    if (rate.SellPrice === undefined) missingFields.push('SELL');
    if (rate.CapAmount === undefined) missingFields.push('CAP');

    if (missingFields.length > 0) {
      throw new InvalidSyntaxError(
        `Missing required fields: ${missingFields.join(', ')}`,
        lineNumber
      );
    }

    return rate as IFxRate;
  }

  private async processLines(lines: string[], rate: Partial<IFxRate>, lineNumber: number): Promise<void> {
   
    for (const [index, line] of lines.entries()) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;

      try {
        if (FXQL_REGEX.BUY.test(trimmedLine)) {
            const match = FXQL_REGEX.BUY.exec(trimmedLine);
            await this.processBuySellLine('BUY', match[1], rate, lineNumber + index + 1, line.indexOf(match[1]));
          } else if (FXQL_REGEX.SELL.test(trimmedLine)) {
            const match = FXQL_REGEX.SELL.exec(trimmedLine);
            await this.processBuySellLine('SELL', match[1], rate, lineNumber + index + 1, line.indexOf(match[1]));
          } else if (FXQL_REGEX.CAP.test(trimmedLine)) {
            const match = FXQL_REGEX.CAP.exec(trimmedLine);
            await this.processCapLine(match[1], rate, lineNumber + index + 1, line.indexOf(match[1]));
          }else {
          throw new InvalidSyntaxError(
            `Invalid line format: "${trimmedLine}"`,
            lineNumber + index + 1
          );
        }
      } catch (error) {
        throw error 
      }
    }
  }

  private async processBuySellLine(
    type: 'BUY' | 'SELL',
    amount: string,
    rate: Partial<IFxRate>,
    line: number,
    column: number
  ): Promise<void> {
    const value = parseFloat(amount);
    await this.validatorService.validateAmount(value, amount, line, column);

    if (type === 'BUY') {
      rate.BuyPrice = value;
    } else {
      rate.SellPrice = value;
    }
  }

  private async processCapLine(
    amount: string,
    rate: Partial<IFxRate>,
    line: number,
    column: number
  ): Promise<void> {
    const value = parseInt(amount, 10);
    await this.validatorService.validateCap(value, line, column);
    rate.CapAmount = value;
  }
}