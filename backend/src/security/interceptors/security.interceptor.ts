import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { SecurityService } from '../security.service';

@Injectable()
export class SecurityInterceptor implements NestInterceptor {
  constructor(private readonly securityService: SecurityService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    // Log request for security monitoring
    this.logRequest(request);

    // Add security headers to response
    this.addSecurityHeaders(response);

    return next.handle().pipe(
      tap(() => {
        // Log successful response
        this.logResponse(request, response);
      }),
    );
  }

  private logRequest(request: any): void {
    const sensitiveData = this.hasSensitiveData(request);

    if (sensitiveData.detected) {
      this.securityService.logSecurityEvent(
        'Request with sensitive patterns detected',
        {
          ip: request.ip,
          userAgent: request.get('User-Agent'),
          url: request.url,
          method: request.method,
          patterns: sensitiveData.patterns,
        },
      );
    }
  }

  private logResponse(request: any, response: any): void {
    // Log if response contains potentially sensitive data
    const statusCode = response.statusCode;

    if (statusCode >= 400) {
      this.securityService.logSecurityEvent('Error response', {
        ip: request.ip,
        url: request.url,
        method: request.method,
        statusCode,
      });
    }
  }

  private addSecurityHeaders(response: any): void {
    // Add security headers
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('X-Frame-Options', 'DENY');
    response.setHeader('X-XSS-Protection', '1; mode=block');
    response.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.setHeader(
      'Permissions-Policy',
      'geolocation=(), microphone=(), camera=()',
    );
  }

  private hasSensitiveData(request: any): {
    detected: boolean;
    patterns: string[];
  } {
    const detectedPatterns: string[] = [];

    // Check query parameters
    if (request.query) {
      for (const [key, value] of Object.entries(request.query)) {
        if (
          typeof value === 'string' &&
          !this.securityService.isSafeString(value)
        ) {
          detectedPatterns.push(`query.${key}`);
        }
      }
    }

    // Check body parameters
    if (request.body) {
      this.checkObjectForSensitiveData(request.body, 'body', detectedPatterns);
    }

    // Check URL parameters
    if (request.params) {
      for (const [key, value] of Object.entries(request.params)) {
        if (
          typeof value === 'string' &&
          !this.securityService.isSafeString(value)
        ) {
          detectedPatterns.push(`params.${key}`);
        }
      }
    }

    return {
      detected: detectedPatterns.length > 0,
      patterns: detectedPatterns,
    };
  }

  private checkObjectForSensitiveData(
    obj: any,
    prefix: string,
    patterns: string[],
  ): void {
    if (!obj || typeof obj !== 'object') {
      return;
    }

    for (const [key, value] of Object.entries(obj)) {
      const fullKey = `${prefix}.${key}`;

      if (
        typeof value === 'string' &&
        !this.securityService.isSafeString(value)
      ) {
        patterns.push(fullKey);
      } else if (typeof value === 'object' && value !== null) {
        this.checkObjectForSensitiveData(value, fullKey, patterns);
      }
    }
  }
}
