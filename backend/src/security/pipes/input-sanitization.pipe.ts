import {
  Injectable,
  PipeTransform,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { SecurityService } from '../security.service';

@Injectable()
export class InputSanitizationPipe implements PipeTransform {
  constructor(private readonly securityService: SecurityService) {}

  transform(value: any, metadata: ArgumentMetadata): any {
    if (!value) {
      return value;
    }

    try {
      return this.sanitizeValue(value);
    } catch (error) {
      this.securityService.logSecurityEvent('Input sanitization failed', {
        value: typeof value === 'string' ? value.substring(0, 100) : value,
        error: error.message,
        metadata,
      });
      throw new BadRequestException('Invalid input detected');
    }
  }

  private sanitizeValue(value: any): any {
    if (value === null || value === undefined) {
      return value;
    }

    if (typeof value === 'string') {
      // Check if the string is safe first
      if (!this.securityService.isSafeString(value)) {
        this.securityService.logSecurityEvent(
          'Potentially malicious input detected',
          {
            input: value.substring(0, 100),
          },
        );
        throw new BadRequestException('Potentially malicious input detected');
      }

      // Sanitize the string
      return this.securityService.sanitizeString(value);
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
      return value;
    }

    if (Array.isArray(value)) {
      return value.map((item) => this.sanitizeValue(item));
    }

    if (typeof value === 'object') {
      const sanitizedObject: any = {};
      for (const [key, val] of Object.entries(value)) {
        // Sanitize the key as well
        const sanitizedKey = this.securityService.sanitizeString(key);
        sanitizedObject[sanitizedKey] = this.sanitizeValue(val);
      }
      return sanitizedObject;
    }

    return value;
  }
}
