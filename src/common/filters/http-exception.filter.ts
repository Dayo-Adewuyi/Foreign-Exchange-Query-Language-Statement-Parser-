import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { Response } from 'express';
import { ERROR_CODES } from '../constants/currency.constants';
import { FxqlError } from '../../core/errors/fxql-errors';
import { IErrorResponse } from '../../core/domain/interfaces/error.interface';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: Error | FxqlError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let errorResponse: IErrorResponse;

    if (exception instanceof FxqlError) {
      errorResponse = {
        message: exception.message,
        code: exception.code,
        ...(exception.position && { position: exception.position }),
      };
      response.status(400).json(errorResponse);
      return;
    }

    errorResponse = {
      message: 'Internal server error',
      code: ERROR_CODES.SERVER_ERROR,
    };
    response.status(500).json(errorResponse);
  }
}
