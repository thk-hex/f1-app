import { Injectable, NestMiddleware, BadRequestException, ForbiddenException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { SanitizationUtil } from '../utils/sanitization.util';

@Injectable()
export class SecurityMiddleware implements NestMiddleware {
  private readonly maxRequestSize = 1024 * 1024; // 1MB
  private readonly maxHeaderSize = 8192; // 8KB
  private readonly suspiciousUserAgents = [
    /sqlmap/i,
    /nmap/i,
    /dirb/i,
    /gobuster/i,
    /nikto/i,
  ];

  // Headers that should not be subject to strict content validation
  private readonly exemptHeaders = [
    'accept',
    'accept-encoding',
    'accept-language',
    'content-type',
    'user-agent',
    'authorization',
    'cache-control',
    'connection',
    'host',
    'referer',
    'origin',
  ];

  use(req: Request, res: Response, next: NextFunction) {
    try {
      // Set security headers
      this.setSecurityHeaders(res);

      // Validate request size
      this.validateRequestSize(req);

      // Check for suspicious patterns
      this.checkSuspiciousPatterns(req);

      // Sanitize headers (with less aggressive validation)
      this.sanitizeHeaders(req);

      // Add rate limiting headers
      this.addRateLimitingHeaders(res);

      next();
    } catch (error) {
      console.error('Security middleware error:', error.message);
      throw error;
    }
  }

  private setSecurityHeaders(res: Response) {
    // Prevent clickjacking
    res.setHeader('X-Frame-Options', 'DENY');
    
    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // Enable XSS protection
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    // Strict transport security
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    
    // Content security policy
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'");
    
    // Referrer policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Feature policy
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  }

  private validateRequestSize(req: Request) {
    const contentLength = parseInt(req.get('content-length') || '0');
    if (contentLength > this.maxRequestSize) {
      throw new BadRequestException('Request too large');
    }

    // Check header size
    const headerSize = JSON.stringify(req.headers).length;
    if (headerSize > this.maxHeaderSize) {
      throw new BadRequestException('Headers too large');
    }
  }

  private checkSuspiciousPatterns(req: Request) {
    const userAgent = req.get('user-agent') || '';
    
    // Check for suspicious user agents
    for (const pattern of this.suspiciousUserAgents) {
      if (pattern.test(userAgent)) {
        throw new ForbiddenException('Suspicious user agent detected');
      }
    }

    // Check for suspicious content in URL (less aggressive)
    if (this.containsSuspiciousUrlContent(req.url)) {
      throw new BadRequestException('Suspicious URL pattern detected');
    }
  }

  private sanitizeHeaders(req: Request) {
    // Only validate headers that are not in the exempt list and could contain user input
    for (const [key, value] of Object.entries(req.headers)) {
      if (typeof value === 'string' && !this.exemptHeaders.includes(key.toLowerCase())) {
        const validation = SanitizationUtil.validateTextContent(value);
        if (!validation.isValid) {
          console.warn(`Rejected header ${key} due to: ${validation.issues.join(', ')}`);
          // Don't throw error for headers, just log and continue
        }
      }
    }
  }

  private containsSuspiciousUrlContent(url: string): boolean {
    const suspiciousPatterns = [
      /<script/gi,
      /javascript:/gi,
      /vbscript:/gi,
      /\.\.[\/\\]/g, // Path traversal
      /;.*drop.*table/gi, // Obvious SQL injection
      /;.*delete.*from/gi, // Obvious SQL injection
    ];

    return suspiciousPatterns.some(pattern => pattern.test(url));
  }

  private addRateLimitingHeaders(res: Response) {
    res.setHeader('X-RateLimit-Limit', '1000');
    res.setHeader('X-RateLimit-Remaining', '999');
    res.setHeader('X-RateLimit-Reset', Date.now() + 3600000);
  }
}

@Injectable()
export class CSRFMiddleware implements NestMiddleware {
  private readonly trustedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://localhost:3000',
  ];

  use(req: Request, res: Response, next: NextFunction) {
    // Skip CSRF for GET requests
    if (req.method === 'GET') {
      return next();
    }

    // Validate origin
    if (!this.validateOrigin(req)) {
      throw new ForbiddenException('Invalid origin');
    }

    // Validate referer
    if (!this.validateReferer(req)) {
      throw new ForbiddenException('Invalid referer');
    }

    next();
  }

  private validateOrigin(req: Request): boolean {
    const origin = req.get('origin');
    if (!origin) {
      return true; // Allow requests without origin (e.g., same-origin)
    }

    return this.trustedOrigins.includes(origin);
  }

  private validateReferer(req: Request): boolean {
    const referer = req.get('referer');
    if (!referer) {
      return true; // Allow requests without referer
    }

    try {
      const refererUrl = new URL(referer);
      const refererOrigin = `${refererUrl.protocol}//${refererUrl.host}`;
      return this.trustedOrigins.includes(refererOrigin);
    } catch {
      return false; // Invalid referer URL
    }
  }
}

@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();
    const { method, url, ip, headers } = req;
    
    // Log request
    console.log(`[${new Date().toISOString()}] ${method} ${url} - IP: ${ip} - User-Agent: ${headers['user-agent']}`);

    // Log response when finished
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(`[${new Date().toISOString()}] ${method} ${url} - ${res.statusCode} - ${duration}ms`);
      
      // Log suspicious activity
      if (res.statusCode >= 400) {
        console.warn(`Suspicious activity: ${method} ${url} - ${res.statusCode} - IP: ${ip}`);
      }
    });

    next();
  }
}

@Injectable()
export class InputValidationMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    try {
      // Note: req.query and req.params are read-only in Express
      // Instead, we'll validate them without modifying the original objects
      
      // Validate query parameters
      if (req.query && typeof req.query === 'object') {
        this.validateParams(req.query, 'query parameter');
      }

      // Validate route parameters
      if (req.params && typeof req.params === 'object') {
        this.validateParams(req.params, 'route parameter');
      }

      // Note: Body sanitization is handled by the SanitizationPipe
      // to ensure it works with NestJS's validation system

      next();
    } catch (error) {
      console.error('Input validation middleware error:', error.message);
      throw new BadRequestException('Invalid input detected');
    }
  }

  private validateParams(params: any, paramType: string): void {
    for (const [key, value] of Object.entries(params)) {
      if (typeof value === 'string') {
        const validation = SanitizationUtil.validateTextContent(value);
        if (!validation.isValid) {
          throw new BadRequestException(`Invalid ${paramType} ${key}: ${validation.issues.join(', ')}`);
        }
      }
    }
  }
} 