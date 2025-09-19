import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  timestamp: string;
  path: string;
  correlationId?: string;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Observable<ApiResponse<T>> {
    const request = context.switchToHttp().getRequest();
    const path = request.url;
    const correlationId = request.headers["x-correlation-id"];

    return next.handle().pipe(
      map((data) => {
        // Don't transform if data is already in the expected format
        if (data && typeof data === "object" && "success" in data) {
          return data as ApiResponse<T>;
        }

        // Handle different response types
        let responseData = data;
        let message: string | undefined;

        // Extract message from response if it exists
        if (data && typeof data === "object") {
          if ("message" in data && typeof data.message === "string") {
            message = data.message;
            // Remove message from data to avoid duplication
            const { message: _, ...rest } = data as any;
            responseData = Object.keys(rest).length > 0 ? rest : undefined;
          }
        }

        return {
          success: true,
          data: responseData,
          message,
          timestamp: new Date().toISOString(),
          path,
          ...(correlationId && { correlationId }),
        };
      })
    );
  }
}
