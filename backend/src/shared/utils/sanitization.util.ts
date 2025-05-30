import * as DOMPurify from 'isomorphic-dompurify';

export interface SanitizationOptions {
  allowHtml?: boolean;
  maxLength?: number;
  trimWhitespace?: boolean;
  stripEmptyStrings?: boolean;
  allowedTags?: string[];
  allowedAttributes?: { [key: string]: string[] };
}

export class SanitizationUtil {
  private static readonly DEFAULT_HTML_OPTIONS = {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
  };

  private static readonly BASIC_HTML_OPTIONS = {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
  };

  /**
   * Sanitize string input to prevent XSS attacks
   */
  static sanitizeString(input: string, options: SanitizationOptions = {}): string {
    if (typeof input !== 'string') {
      return '';
    }

    let sanitized = input;

    // Trim whitespace if enabled
    if (options.trimWhitespace !== false) {
      sanitized = sanitized.trim();
    }

    // Check maximum length
    if (options.maxLength && sanitized.length > options.maxLength) {
      sanitized = sanitized.substring(0, options.maxLength);
    }

    // Handle HTML content
    if (options.allowHtml) {
      const purifyOptions = options.allowedTags 
        ? {
            ALLOWED_TAGS: options.allowedTags,
            ALLOWED_ATTR: options.allowedAttributes ? Object.keys(options.allowedAttributes) : [],
            KEEP_CONTENT: true,
          }
        : this.BASIC_HTML_OPTIONS;
      
      sanitized = DOMPurify.sanitize(sanitized, purifyOptions);
    } else {
      // Strip all HTML and escape special characters
      sanitized = DOMPurify.sanitize(sanitized, this.DEFAULT_HTML_OPTIONS);
      sanitized = this.escapeXSSCharacters(sanitized);
    }

    // Remove empty strings if required
    if (options.stripEmptyStrings && sanitized.trim() === '') {
      return '';
    }

    return sanitized;
  }

  /**
   * Sanitize object recursively
   */
  static sanitizeObject(obj: any, options: SanitizationOptions = {}): any {
    if (obj === null || obj === undefined) {
      return obj;
    }

    if (typeof obj === 'string') {
      return this.sanitizeString(obj, options);
    }

    if (typeof obj === 'number' || typeof obj === 'boolean') {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item, options));
    }

    if (typeof obj === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        const sanitizedKey = this.sanitizeString(key, { ...options, allowHtml: false });
        sanitized[sanitizedKey] = this.sanitizeObject(value, options);
      }
      return sanitized;
    }

    return obj;
  }

  /**
   * Validate and sanitize input based on type
   */
  static validateAndSanitize(input: any, type: 'text' | 'number' | 'email' | 'alphanumeric' | 'identifier' = 'text'): any {
    if (input === null || input === undefined) {
      return input;
    }

    switch (type) {
      case 'text':
        return this.sanitizeString(String(input), { 
          allowHtml: false, 
          trimWhitespace: true,
          maxLength: 1000
        });

      case 'number':
        const num = Number(input);
        return isNaN(num) ? null : num;

      case 'email':
        const email = this.sanitizeString(String(input), { allowHtml: false, trimWhitespace: true });
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email) ? email : null;

      case 'alphanumeric':
        const alphanumeric = this.sanitizeString(String(input), { allowHtml: false, trimWhitespace: true });
        return alphanumeric.replace(/[^a-zA-Z0-9]/g, '');

      case 'identifier':
        const identifier = this.sanitizeString(String(input), { allowHtml: false, trimWhitespace: true });
        return identifier.replace(/[^a-zA-Z0-9_-]/g, '');

      default:
        return this.sanitizeString(String(input));
    }
  }

  /**
   * Escape XSS-prone characters
   */
  private static escapeXSSCharacters(input: string): string {
    const escapeMap: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;',
      '`': '&#96;',
      '=': '&#x3D;'
    };

    return input.replace(/[&<>"'`=\/]/g, (char) => escapeMap[char]);
  }

  /**
   * Validate text content for potential threats
   */
  static validateTextContent(input: string): { isValid: boolean; issues: string[] } {
    const issues: string[] = [];

    // Check for script tags
    if (/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi.test(input)) {
      issues.push('Contains script tags');
    }

    // Check for JavaScript event handlers
    if (/on\w+\s*=/gi.test(input)) {
      issues.push('Contains JavaScript event handlers');
    }

    // Check for javascript: protocol
    if (/javascript:/gi.test(input)) {
      issues.push('Contains javascript: protocol');
    }

    // Check for data: protocol with suspicious content
    if (/data:(?!image\/)[^;]+;[^,]*,/gi.test(input)) {
      issues.push('Contains suspicious data: protocol');
    }

    // Check for SQL injection patterns (less aggressive)
    const sqlPatterns = [
      /('|(\\')).*(\b(DROP|DELETE|INSERT|UPDATE|CREATE|ALTER|EXEC|UNION)\b)/gi,
      /(\b(UNION)\b).*(\b(SELECT)\b)/gi,
      /(;|\||&).*(\b(DROP|DELETE|CREATE|ALTER)\b)/gi,
      /(--|\/\*).*(\b(DROP|DELETE|CREATE|ALTER)\b)/gi,
    ];

    for (const pattern of sqlPatterns) {
      if (pattern.test(input)) {
        issues.push('Contains potential SQL injection patterns');
        break;
      }
    }

    // Check for path traversal
    if (/(\.\.[\/\\])/g.test(input)) {
      issues.push('Contains path traversal patterns');
    }

    // Check for command injection (more specific patterns)
    if (/(;|\||&).*(\b(rm|del|format|shutdown|reboot)\b)/gi.test(input)) {
      issues.push('Contains potential command injection patterns');
    }

    return {
      isValid: issues.length === 0,
      issues
    };
  }

  /**
   * Sanitize query parameters
   */
  static sanitizeQuery(query: Record<string, any>): Record<string, any> {
    return this.sanitizeObject(query, { allowHtml: false, trimWhitespace: true });
  }

  /**
   * Sanitize request body
   */
  static sanitizeBody(body: any): any {
    return this.sanitizeObject(body, { allowHtml: false, trimWhitespace: true });
  }

  /**
   * Sanitize filename for safe storage
   */
  static sanitizeFilename(filename: string): string {
    if (!filename || typeof filename !== 'string') {
      return 'unnamed';
    }

    // Remove path characters and dangerous sequences
    let sanitized = filename
      .replace(/[\/\\:*?"<>|]/g, '')
      .replace(/\.\./g, '')
      .replace(/^\.+/, '')
      .trim();

    // Return default if empty after sanitization
    if (!sanitized) {
      return 'unnamed';
    }

    // Limit length
    if (sanitized.length > 255) {
      const ext = sanitized.split('.').pop() || '';
      const name = sanitized.substring(0, 255 - ext.length - 1);
      sanitized = `${name}.${ext}`;
    }

    return sanitized;
  }

  /**
   * Check if string is a safe identifier (letters, numbers, underscore, hyphen only)
   */
  static isSafeIdentifier(input: string): boolean {
    return /^[a-zA-Z0-9_-]+$/.test(input);
  }

  /**
   * Sanitize identifier to be safe for database/file operations
   */
  static sanitizeIdentifier(identifier: string): string {
    if (!identifier || typeof identifier !== 'string') {
      return '';
    }

    return identifier
      .replace(/[^a-zA-Z0-9_-]/g, '')
      .substring(0, 64); // Reasonable limit for identifiers
  }
} 