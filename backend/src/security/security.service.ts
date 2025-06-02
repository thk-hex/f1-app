import { Injectable } from '@nestjs/common';
import * as DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import * as validator from 'validator';

@Injectable()
export class SecurityService {
  private domPurify: any;

  constructor() {
    // Initialize DOMPurify for server-side usage
    const window = new JSDOM('').window;
    this.domPurify = DOMPurify(window as any);
  }

  /**
   * Sanitizes HTML content to prevent XSS attacks
   * @param input - The input string to sanitize
   * @returns Sanitized string
   */
  sanitizeHtml(input: string): string {
    if (!input || typeof input !== 'string') {
      return '';
    }
    return this.domPurify.sanitize(input, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
    });
  }

  /**
   * Sanitizes input for SQL injection prevention (additional layer on top of Prisma)
   * @param input - The input string to sanitize
   * @returns Sanitized string
   */
  sanitizeSql(input: string): string {
    if (!input || typeof input !== 'string') {
      return '';
    }

    // Remove or escape potentially dangerous SQL characters
    return input
      .replace(/'/g, "''") // Escape single quotes
      .replace(/;/g, '') // Remove semicolons
      .replace(/--/g, '') // Remove SQL comments
      .replace(/\/\*/g, '') // Remove block comment start
      .replace(/\*\//g, '') // Remove block comment end
      .replace(/xp_/gi, '') // Remove extended stored procedures
      .replace(/sp_/gi, '') // Remove stored procedures
      .trim();
  }

  /**
   * Sanitizes general string input
   * @param input - The input string to sanitize
   * @returns Sanitized string
   */
  sanitizeString(input: string): string {
    if (!input || typeof input !== 'string') {
      return '';
    }

    // First sanitize HTML/XSS
    let sanitized = this.sanitizeHtml(input);

    // Then escape additional characters
    sanitized = validator.escape(sanitized);

    // Remove null bytes and other control characters
    sanitized = sanitized.replace(/\0/g, '').replace(/[\x00-\x1F\x7F]/g, '');

    return sanitized.trim();
  }

  /**
   * Validates if a string is safe (doesn't contain suspicious patterns)
   * @param input - The input string to validate
   * @returns true if safe, false otherwise
   */
  isSafeString(input: string): boolean {
    if (!input || typeof input !== 'string') {
      return true;
    }

    // Check for common XSS patterns
    const xssPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /<iframe[^>]*>.*?<\/iframe>/gi,
      /javascript:/gi,
      /vbscript:/gi,
      /onload=/gi,
      /onerror=/gi,
      /onclick=/gi,
      /onmouseover=/gi,
    ];

    // Check for SQL injection patterns
    const sqlPatterns = [
      /('|(\\')|(;)|(--)|(\s(or|and)\s+.*(=|like)))/gi,
      /(union(\s+(all|distinct))?(\s+select))/gi,
      /(insert(\s+into)?|update(\s+set)?|delete(\s+from)?)\s+\w+/gi,
      /(drop|create|alter|truncate)\s+(table|database|schema)/gi,
    ];

    const allPatterns = [...xssPatterns, ...sqlPatterns];

    return !allPatterns.some((pattern) => pattern.test(input));
  }

  /**
   * Validates and sanitizes year input specifically for F1 data
   * @param year - The year to validate
   * @returns Sanitized year number or throws error
   */
  validateAndSanitizeYear(year: any): number {
    if (!year) {
      throw new Error('Year is required');
    }

    let yearNum: number;

    if (typeof year === 'string') {
      // Sanitize the string first
      const sanitizedYear = this.sanitizeString(year);
      yearNum = parseInt(sanitizedYear, 10);
    } else if (typeof year === 'number') {
      yearNum = year;
    } else {
      throw new Error('Invalid year format');
    }

    if (
      isNaN(yearNum) ||
      yearNum < 1950 ||
      yearNum > new Date().getFullYear()
    ) {
      throw new Error('Invalid year value');
    }

    return yearNum;
  }

  /**
   * Logs security events for monitoring
   * @param event - Security event description
   * @param details - Additional details
   */
  logSecurityEvent(event: string, details: any = {}): void {
    console.warn(`[SECURITY] ${event}`, {
      timestamp: new Date().toISOString(),
      ...details,
    });
  }
}
