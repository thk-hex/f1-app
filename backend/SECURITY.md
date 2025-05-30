# Security Implementation Guide

## Overview

This F1 Champions API implements comprehensive input sanitization and security measures to protect against XSS attacks, SQL injection, and other common web vulnerabilities while maintaining usability for normal requests.

## Security Features

### 1. Input Sanitization

#### SanitizationUtil
- **XSS Protection**: Removes script tags, JavaScript event handlers, and dangerous protocols
- **SQL Injection Prevention**: Detects and blocks obvious SQL injection patterns
- **Path Traversal Protection**: Prevents directory traversal attacks
- **Command Injection Protection**: Blocks command injection attempts
- **HTML Sanitization**: Uses DOMPurify to safely handle HTML content
- **Balanced Approach**: Less aggressive validation to avoid false positives while maintaining security

#### Key Methods:
```typescript
// Sanitize string input
SanitizationUtil.sanitizeString(input, options)

// Validate content for threats (improved to reduce false positives)
SanitizationUtil.validateTextContent(input)

// Sanitize objects recursively
SanitizationUtil.sanitizeObject(obj, options)

// Type-specific validation
SanitizationUtil.validateAndSanitize(input, type)
```

### 2. Decorators

#### @SanitizedString
Combines sanitization and validation for DTO properties:
```typescript
@SanitizedString({ maxLength: 50, trimWhitespace: true })
name: string;
```

#### @SanitizeString
Transform decorator for input sanitization:
```typescript
@SanitizeString({ allowHtml: false, maxLength: 100 })
description: string;
```

#### @IsXssSafe / @IsSqlSafe
Validation decorators for security checks:
```typescript
@IsXssSafe()
@IsSqlSafe()
userInput: string;
```

### 3. Pipes

#### SanitizationPipe
- Automatically sanitizes request parameters, query strings, and body content
- Applied globally to all routes
- **Improved**: Only validates obvious threats to reduce false positives
- Validates input before processing

#### StrictSanitizationPipe
- Enhanced version with stricter validation
- Rejects any suspicious content
- Use for high-security endpoints

### 4. Middleware

#### SecurityMiddleware
- Sets security headers (CSP, HSTS, X-Frame-Options, etc.)
- Validates request size and headers
- Detects suspicious user agents and patterns
- **Improved**: Exempts common headers from strict validation (accept, user-agent, etc.)
- Less aggressive URL pattern detection

#### CSRFMiddleware
- Validates request origin and referer
- Protects against cross-site request forgery
- Configurable trusted origins

#### InputValidationMiddleware
- **Fixed**: No longer tries to modify read-only Express properties
- Validates query parameters and route parameters
- Logs validation failures without breaking normal requests

#### RequestLoggingMiddleware
- Logs all requests and responses
- Tracks suspicious activity
- Performance monitoring

### 5. Database Protection

#### Repository-Level Sanitization
All external data is sanitized before database operations:
```typescript
// Champions Repository
const sanitizedData = {
  season: SanitizationUtil.sanitizeString(data.season, { maxLength: 4 }),
  givenName: SanitizationUtil.sanitizeString(data.givenName, { maxLength: 50 }),
  // ...
};
```

#### Prisma ORM
- Automatic SQL injection prevention through parameterized queries
- Type-safe database operations
- No raw SQL execution

## Configuration

### Environment Variables
```env
FRONTEND_URL=http://localhost:3000  # Trusted origin for CSRF protection
NODE_ENV=production                 # Disables error messages in production
```

### Security Headers
The following security headers are automatically set:
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- `Content-Security-Policy: default-src 'self'; ...`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`

### Header Exemptions
Common headers are exempted from strict validation to prevent false positives:
- `accept`, `accept-encoding`, `accept-language`
- `content-type`, `user-agent`, `authorization`
- `cache-control`, `connection`, `host`
- `referer`, `origin`

## Improved Validation Patterns

### Less Aggressive SQL Injection Detection
```typescript
// Only triggers on obvious SQL injection attempts
const sqlPatterns = [
  /('|(\\')).*(\b(DROP|DELETE|INSERT|UPDATE|CREATE|ALTER|EXEC|UNION)\b)/gi,
  /(\b(UNION)\b).*(\b(SELECT)\b)/gi,
  /(;|\||&).*(\b(DROP|DELETE|CREATE|ALTER)\b)/gi,
  /(--|\/\*).*(\b(DROP|DELETE|CREATE|ALTER)\b)/gi,
];
```

### Obvious Threat Detection
```typescript
// Only blocks clear security threats
const obviousThreats = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript:/gi,
  /\.\.[\/\\]/g,
  /(;|\||&).*(\b(DROP|DELETE|CREATE|ALTER)\b)/gi,
];
```

## Usage Examples

### DTO with Sanitization
```typescript
export class UserDto {
  @ApiProperty()
  @IsString()
  @SanitizedString({ maxLength: 50, trimWhitespace: true })
  name: string;

  @ApiProperty()
  @IsEmail()
  @SanitizeString({ allowHtml: false })
  email: string;
}
```

### Controller with Validation
```typescript
@Controller('users')
export class UsersController {
  @Post()
  async createUser(@Body() userData: UserDto) {
    // Data is automatically sanitized by pipes
    return this.usersService.create(userData);
  }

  @Get(':id')
  async getUser(@Param('id') id: string) {
    // Parameter is validated by middleware
    return this.usersService.findById(id);
  }
}
```

### Service with Additional Sanitization
```typescript
@Injectable()
export class UsersService {
  async create(userData: UserDto) {
    // Additional sanitization for external data
    const sanitizedData = SanitizationUtil.sanitizeObject(userData);
    
    // Validate before database operation
    const validation = SanitizationUtil.validateTextContent(userData.name);
    if (!validation.isValid) {
      throw new BadRequestException(`Invalid input: ${validation.issues.join(', ')}`);
    }
    
    return this.repository.create(sanitizedData);
  }
}
```

## Testing

### Security Tests
Run the security test suite:
```bash
npm test -- sanitization.util.spec.ts
```

### Manual Testing
Test with malicious payloads:
```bash
# XSS attempt (should be blocked)
curl -X GET "http://localhost:3000/api/champions?search=<script>alert('xss')</script>"

# SQL injection attempt (should be blocked)
curl -X GET "http://localhost:3000/api/race-winners/2021'; DROP TABLE users; --"

# Path traversal attempt (should be blocked)
curl -X GET "http://localhost:3000/api/champions/../../../etc/passwd"

# Normal requests (should work fine)
curl -X GET "http://localhost:3000/api/champions"
curl -X GET "http://localhost:3000/api/race-winners/2021"
```

## Fixed Issues

### 1. Header Validation False Positives
- **Problem**: Common headers like `accept` were triggering SQL injection warnings
- **Solution**: Exempted standard HTTP headers from strict content validation
- **Result**: Normal API requests work without false security warnings

### 2. Express Read-Only Property Error
- **Problem**: Middleware tried to modify `req.query` and `req.params` (read-only)
- **Solution**: Changed to validation-only approach without modifying original objects
- **Result**: No more "Cannot set property" errors

### 3. Overly Aggressive Validation
- **Problem**: Simple content like "json" triggered SQL injection detection
- **Solution**: Made patterns more specific to obvious threats only
- **Result**: Better balance between security and usability

## Security Checklist

- [x] Input sanitization on all user inputs
- [x] XSS protection with DOMPurify
- [x] SQL injection prevention with Prisma ORM
- [x] CSRF protection with origin validation
- [x] Security headers implementation
- [x] Request size validation
- [x] Suspicious pattern detection (improved)
- [x] Comprehensive logging
- [x] Type-safe validation with class-validator
- [x] External API data sanitization
- [x] Database-level input cleaning
- [x] False positive reduction
- [x] Express compatibility fixes

## Best Practices

1. **Always sanitize external data** before database operations
2. **Use type-safe DTOs** with validation decorators
3. **Apply sanitization at multiple layers** (middleware, pipes, services)
4. **Log security events** for monitoring and analysis
5. **Regularly update dependencies** for security patches
6. **Test with malicious payloads** during development
7. **Use environment-specific configurations** for security settings
8. **Balance security with usability** to avoid blocking legitimate requests

## Monitoring

### Security Logs
Monitor these log patterns:
- `Suspicious activity:` - Failed requests with 4xx/5xx status codes
- `Rejected header` - Headers containing malicious content (now less frequent)
- `Skipping data due to validation issues` - External data validation failures
- `Invalid input detected` - User input validation failures

### Metrics to Track
- Request validation failure rate
- Suspicious user agent detections
- CSRF protection triggers
- Input sanitization events
- False positive rates

## Dependencies

### Security-Related Packages
- `isomorphic-dompurify`: XSS protection and HTML sanitization
- `class-validator`: Input validation and custom validators
- `class-transformer`: Data transformation and sanitization
- `@nestjs/common`: Built-in security features and pipes

### Regular Updates
Keep security dependencies updated:
```bash
npm audit
npm update
```

## Incident Response

### If Security Issue Detected
1. **Immediate**: Block suspicious IP addresses
2. **Short-term**: Review and enhance validation rules
3. **Long-term**: Analyze attack patterns and improve defenses

### Security Contact
For security issues, please contact the development team immediately. 