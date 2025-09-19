import { Injectable } from "@nestjs/common";
import { ThrottlerGuard } from "@nestjs/throttler";

@Injectable()
export class ThrottlerBehindProxyGuard extends ThrottlerGuard {
  protected getTracker(req: Record<string, any>): string {
    // Get client IP from various headers (for use behind proxy/load balancer)
    const clientIp =
      req.headers["cf-connecting-ip"] || // Cloudflare
      req.headers["x-forwarded-for"]?.split(",")[0] || // Standard proxy header
      req.headers["x-real-ip"] || // Nginx proxy
      req.connection?.remoteAddress || // Direct connection
      req.socket?.remoteAddress || // Socket connection
      (req.connection?.socket ? req.connection.socket.remoteAddress : null) ||
      req.ip; // Express default

    return clientIp || "unknown";
  }
}
