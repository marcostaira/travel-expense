import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Get correlation ID from header or generate new one
    const correlationId =
      (req.headers["x-correlation-id"] as string) ||
      (req.headers["x-request-id"] as string) ||
      uuidv4();

    // Add to request for logging and tracing
    req.headers["x-correlation-id"] = correlationId;

    // Add to response headers
    res.setHeader("x-correlation-id", correlationId);

    // Store in request object for easy access
    (req as any).correlationId = correlationId;

    next();
  }
}
