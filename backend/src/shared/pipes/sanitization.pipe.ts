import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { SanitizationUtil } from '../utils/sanitization.util';

@Injectable()
export class SanitizationPipe implements PipeTransform<any> {
  async transform(value: any, { metatype, type }: ArgumentMetadata) {
    // Don't sanitize if value is null/undefined
    if (value === null || value === undefined) {
      return value;
    }

    // Don't sanitize built-in types or if no metatype
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    // Sanitize different types of input
    switch (type) {
      case 'param':
      case 'query':
        return this.sanitizeParams(value);
      case 'body':
        return SanitizationUtil.sanitizeBody(value);
      default:
        return value;
    }
  }

  private toValidate(metatype: any): boolean {
    const types: any[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }

  private sanitizeParams(params: any): any {
    if (typeof params === 'string') {
      // Only validate for obvious threats, don't be too aggressive
      if (this.containsObviousThreats(params)) {
        throw new BadRequestException('Invalid input detected');
      }
      return SanitizationUtil.sanitizeString(params, { allowHtml: false, trimWhitespace: true });
    }

    if (typeof params === 'object' && params !== null) {
      return SanitizationUtil.sanitizeQuery(params);
    }

    return params;
  }

  private containsObviousThreats(input: string): boolean {
    const obviousThreats = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /\.\.[\/\\]/g,
      /(;|\||&).*(\b(DROP|DELETE|CREATE|ALTER)\b)/gi,
    ];

    return obviousThreats.some(pattern => pattern.test(input));
  }
}

@Injectable()
export class StrictSanitizationPipe implements PipeTransform<any> {
  async transform(value: any, { metatype, type }: ArgumentMetadata) {
    // Don't sanitize if value is null/undefined
    if (value === null || value === undefined) {
      return value;
    }

    // Don't sanitize built-in types or if no metatype
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    // Sanitize different types of input with strict validation
    switch (type) {
      case 'param':
      case 'query':
        return this.sanitizeParamsStrict(value);
      case 'body':
        const sanitizedBody = SanitizationUtil.sanitizeBody(value);
        // Validate entire body for security issues
        const bodyValidation = this.validateObject(sanitizedBody);
        if (!bodyValidation.isValid) {
          throw new BadRequestException(`Request body contains unsafe content: ${bodyValidation.issues.join(', ')}`);
        }
        return sanitizedBody;
      default:
        return value;
    }
  }

  private toValidate(metatype: any): boolean {
    const types: any[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }

  private sanitizeParamsStrict(params: any): any {
    if (typeof params === 'string') {
      // Strict validation - reject anything suspicious
      const validation = SanitizationUtil.validateTextContent(params);
      if (!validation.isValid) {
        throw new BadRequestException(`Invalid input detected: ${validation.issues.join(', ')}`);
      }

      // Only allow safe identifiers for parameters in strict mode
      if (!SanitizationUtil.isSafeIdentifier(params) && !/^\d+$/.test(params)) {
        throw new BadRequestException('Parameter contains invalid characters. Only letters, numbers, underscore, and hyphen are allowed.');
      }

      return SanitizationUtil.sanitizeString(params, { allowHtml: false, trimWhitespace: true });
    }

    if (typeof params === 'object' && params !== null) {
      const sanitized = SanitizationUtil.sanitizeQuery(params);
      const validation = this.validateObject(sanitized);
      if (!validation.isValid) {
        throw new BadRequestException(`Query parameters contain unsafe content: ${validation.issues.join(', ')}`);
      }
      return sanitized;
    }

    return params;
  }

  private validateObject(obj: any): { isValid: boolean; issues: string[] } {
    const allIssues: string[] = [];

    const validateRecursive = (value: any): void => {
      if (typeof value === 'string') {
        const validation = SanitizationUtil.validateTextContent(value);
        if (!validation.isValid) {
          allIssues.push(...validation.issues);
        }
      } else if (Array.isArray(value)) {
        value.forEach(validateRecursive);
      } else if (typeof value === 'object' && value !== null) {
        Object.values(value).forEach(validateRecursive);
      }
    };

    validateRecursive(obj);

    return {
      isValid: allIssues.length === 0,
      issues: [...new Set(allIssues)] // Remove duplicates
    };
  }
} 