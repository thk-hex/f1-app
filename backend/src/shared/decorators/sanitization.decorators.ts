import { Transform } from 'class-transformer';
import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';
import { SanitizationUtil, SanitizationOptions } from '../utils/sanitization.util';

/**
 * Transform decorator that sanitizes string input
 */
export function SanitizeString(options: SanitizationOptions = {}) {
  return Transform(({ value }) => {
    if (typeof value === 'string') {
      return SanitizationUtil.sanitizeString(value, options);
    }
    return value;
  });
}

/**
 * Transform decorator that sanitizes object input
 */
export function SanitizeObject(options: SanitizationOptions = {}) {
  return Transform(({ value }) => {
    return SanitizationUtil.sanitizeObject(value, options);
  });
}

// Custom validator for XSS safety
@ValidatorConstraint({ name: 'isXssSafe', async: false })
export class IsXssSafeConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    if (typeof value !== 'string') {
      return true; // Let other validators handle type checking
    }

    const validation = SanitizationUtil.validateTextContent(value);
    return validation.isValid;
  }

  defaultMessage(args: ValidationArguments) {
    const value = args.value;
    if (typeof value === 'string') {
      const validation = SanitizationUtil.validateTextContent(value);
      return `Input contains unsafe content: ${validation.issues.join(', ')}`;
    }
    return 'Input contains unsafe content';
  }
}

export function IsXssSafe(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsXssSafeConstraint,
    });
  };
}

// Custom validator for SQL injection safety
@ValidatorConstraint({ name: 'isSqlSafe', async: false })
export class IsSqlSafeConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    if (typeof value !== 'string') {
      return true; // Let other validators handle type checking
    }

    // Check for common SQL injection patterns
    const sqlInjectionPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/gi,
      /(\b(OR|AND)\s+[\w\s]*=[\w\s]*)/gi,
      /(;|\||&)/g,
      /('|(\\')|(;|\/\*|\*\/|--|#))/g,
      /(\bunion\b.*\bselect\b)/gi,
      /(\binsert\b.*\binto\b)/gi,
      /(\bdelete\b.*\bfrom\b)/gi,
      /(\bdrop\b.*\btable\b)/gi,
    ];

    for (const pattern of sqlInjectionPatterns) {
      if (pattern.test(value)) {
        return false;
      }
    }

    return true;
  }

  defaultMessage(args: ValidationArguments) {
    return 'Input contains potential SQL injection patterns';
  }
}

export function IsSqlSafe(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsSqlSafeConstraint,
    });
  };
}

/**
 * Combination decorator that applies sanitization and validation
 */
export function SanitizedString(options: SanitizationOptions = {}, validationOptions?: ValidationOptions) {
  return function (target: any, propertyName: string) {
    SanitizeString(options)(target, propertyName);
    IsXssSafe(validationOptions)(target, propertyName);
    IsSqlSafe(validationOptions)(target, propertyName);
  };
}

/**
 * Decorator for alphanumeric-only input
 */
export function SanitizedAlphanumeric(validationOptions?: ValidationOptions) {
  return function (target: any, propertyName: string) {
    Transform(({ value }) => {
      if (typeof value === 'string') {
        return SanitizationUtil.validateAndSanitize(value, 'alphanumeric');
      }
      return value;
    })(target, propertyName);

    // Additional validation to ensure only alphanumeric characters
    registerDecorator({
      target: target.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'string') {
            return true;
          }
          return /^[a-zA-Z0-9]*$/.test(value);
        },
        defaultMessage(args: ValidationArguments) {
          return 'Property must contain only alphanumeric characters';
        },
      },
    });
  };
} 