import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { tap, catchError } from "rxjs/operators";
import { Request, Response } from "express";

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger("HTTP");

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const userAgent = request.get("User-Agent") || "";
    const { ip, method, originalUrl: url } = request;

    // Generate correlation ID if not present
    const correlationId =
      (request.headers["x-correlation-id"] as string) ||
      this.generateCorrelationId();

    // Add correlation ID to response headers
    response.setHeader("x-correlation-id", correlationId);

    const start = Date.now();

    return next.handle().pipe(
      tap((responseBody) => {
        const { statusCode } = response;
        const contentLength = response.get("content-length");
        const responseTime = Date.now() - start;

        // Log successful requests
        this.logger.log({
          method,
          url,
          statusCode,
          responseTime: `${responseTime}ms`,
          contentLength: contentLength || "0",
          userAgent,
          ip,
          correlationId,
          user: (request as any).user?.email || "anonymous",
          tenant: (request as any).user?.tenantId || null,
        });
      }),
      catchError((error) => {
        const { statusCode = 500 } = error;
        const responseTime = Date.now() - start;

        // Log error requests
        this.logger.error({
          method,
          url,
          statusCode,
          responseTime: `${responseTime}ms`,
          userAgent,
          ip,
          correlationId,
          user: (request as any).user?.email || "anonymous",
          tenant: (request as any).user?.tenantId || null,
          error: error.message,
        });

        throw error;
      })
    );
  }

  private generateCorrelationId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
