import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Request, Response } from "express";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = "Internal server error";
    let error = "InternalServerError";
    let details: any = undefined;

    // Handle HTTP exceptions
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === "string") {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === "object") {
        const responseObj = exceptionResponse as any;
        message = responseObj.message || message;
        error = responseObj.error || error;
        details = responseObj.details;

        // Handle validation errors
        if (Array.isArray(responseObj.message)) {
          message = responseObj.message.join(", ");
        }
      }
    }
    // Handle Prisma errors
    else if (exception instanceof PrismaClientKnownRequestError) {
      const prismaError = this.handlePrismaError(exception);
      status = prismaError.status;
      message = prismaError.message;
      error = prismaError.error;
      details = prismaError.details;
    }
    // Handle other errors
    else if (exception instanceof Error) {
      message = exception.message;
      error = exception.name;

      // Log the full error for debugging
      this.logger.error(exception.stack);
    }

    // Create error response
    const errorResponse = {
      statusCode: status,
      error,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      correlationId: request.headers["x-correlation-id"] || undefined,
      ...(details && { details }),
    };

    // Log error for monitoring (exclude 4xx client errors from error logs)
    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url} - ${status} - ${message}`,
        exception instanceof Error ? exception.stack : exception
      );
    } else if (status >= 400) {
      this.logger.warn(
        `${request.method} ${request.url} - ${status} - ${message}`
      );
    }

    // Send response
    response.status(status).json(errorResponse);
  }

  private handlePrismaError(error: PrismaClientKnownRequestError): {
    status: number;
    message: string;
    error: string;
    details?: any;
  } {
    switch (error.code) {
      case "P2002":
        return {
          status: HttpStatus.CONFLICT,
          message: "Registro já existe",
          error: "ConflictError",
          details: {
            constraint: error.meta?.target,
            code: error.code,
          },
        };

      case "P2025":
        return {
          status: HttpStatus.NOT_FOUND,
          message: "Registro não encontrado",
          error: "NotFoundError",
          details: {
            cause: error.meta?.cause,
            code: error.code,
          },
        };

      case "P2003":
        return {
          status: HttpStatus.BAD_REQUEST,
          message: "Violação de chave estrangeira",
          error: "ForeignKeyConstraintError",
          details: {
            field: error.meta?.field_name,
            code: error.code,
          },
        };

      case "P2014":
        return {
          status: HttpStatus.BAD_REQUEST,
          message: "Dados inválidos para a operação",
          error: "InvalidDataError",
          details: {
            relation: error.meta?.relation_name,
            code: error.code,
          },
        };

      case "P2011":
        return {
          status: HttpStatus.BAD_REQUEST,
          message: "Violação de restrição de campo obrigatório",
          error: "RequiredFieldError",
          details: {
            constraint: error.meta?.constraint,
            code: error.code,
          },
        };

      default:
        return {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: "Erro interno do banco de dados",
          error: "DatabaseError",
          details: {
            code: error.code,
            meta: error.meta,
          },
        };
    }
  }
}
