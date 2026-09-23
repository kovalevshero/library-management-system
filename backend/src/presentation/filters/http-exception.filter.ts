import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import {
  BookNotAvailableException,
  BookNotBorrowedByMemberException,
  BorrowLimitExceededException,
  DomainException,
  EntityNotFoundException,
  MemberPenalizedException,
} from '../../domain/exceptions/domain.exception';

@Catch()
export class GlobalHttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalHttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorName = 'InternalServerError';
    let message: string | object = 'An unexpected error occurred';

    if (exception instanceof EntityNotFoundException) {
      status = HttpStatus.NOT_FOUND;
      errorName = exception.name;
      message = exception.message;
    } else if (exception instanceof MemberPenalizedException) {
      status = HttpStatus.FORBIDDEN;
      errorName = exception.name;
      message = exception.message;
    } else if (exception instanceof BookNotAvailableException) {
      status = HttpStatus.CONFLICT;
      errorName = exception.name;
      message = exception.message;
    } else if (
      exception instanceof BorrowLimitExceededException ||
      exception instanceof BookNotBorrowedByMemberException
    ) {
      status = HttpStatus.BAD_REQUEST;
      errorName = exception.name;
      message = exception.message;
    } else if (exception instanceof DomainException) {
      status = HttpStatus.BAD_REQUEST;
      errorName = exception.name;
      message = exception.message;
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      errorName = exception.name;
      message =
        typeof res === 'object' && res !== null && 'message' in res
          ? (res as { message: string | string[] }).message
          : res;
    } else if (exception instanceof Error) {
      this.logger.error(exception.message, exception.stack);
      message = exception.message;
    }

    response.status(status).json({
      statusCode: status,
      error: errorName,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
