import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import { SecurityModule } from './security.module';
import { SecurityService } from './security.service';
import { InputSanitizationPipe } from './pipes/input-sanitization.pipe';
import { SecurityInterceptor } from './interceptors/security.interceptor';

describe('Security Integration Tests', () => {
  let app: INestApplication;
  let securityService: SecurityService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [SecurityModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Apply the same security configuration as main.ts
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: false,
        },
      }),
    );

    const securityInterceptor = app.get(SecurityInterceptor);
    app.useGlobalInterceptors(securityInterceptor);

    const inputSanitizationPipe = app.get(InputSanitizationPipe);
    app.useGlobalPipes(inputSanitizationPipe);

    securityService = app.get<SecurityService>(SecurityService);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('XSS Protection', () => {
    it('should sanitize HTML script tags', () => {
      const maliciousInput = '<script>alert("XSS")</script>Hello World';
      const sanitized = securityService.sanitizeHtml(maliciousInput);

      expect(sanitized).toBe('Hello World');
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('alert');
    });

    it('should sanitize iframe tags', () => {
      const maliciousInput =
        '<iframe src="javascript:alert(1)"></iframe>Safe Content';
      const sanitized = securityService.sanitizeHtml(maliciousInput);

      expect(sanitized).toBe('Safe Content');
      expect(sanitized).not.toContain('<iframe>');
      expect(sanitized).not.toContain('javascript:');
    });

    it('should detect unsafe strings with XSS patterns', () => {
      const xssAttempts = [
        '<script>alert("xss")</script>',
        'javascript:alert(1)',
        '<img src="x" onerror="alert(1)">',
        '<svg onload="alert(1)">',
        'vbscript:msgbox("xss")',
      ];

      xssAttempts.forEach((attempt) => {
        expect(securityService.isSafeString(attempt)).toBe(false);
      });
    });
  });

  describe('SQL Injection Protection', () => {
    it('should sanitize SQL injection attempts', () => {
      const sqlInjection = "'; DROP TABLE users; --";
      const sanitized = securityService.sanitizeSql(sqlInjection);

      expect(sanitized).not.toContain(';');
      expect(sanitized).not.toContain('--');
      expect(sanitized).toContain("''"); // Single quotes should be escaped
      expect(sanitized).toContain('DROP TABLE users'); // Words remain, dangerous chars removed
    });

    it('should remove SQL comments', () => {
      const sqlWithComments =
        'SELECT * FROM users /* malicious comment */ -- another comment';
      const sanitized = securityService.sanitizeSql(sqlWithComments);

      expect(sanitized).not.toContain('/*');
      expect(sanitized).not.toContain('*/');
      expect(sanitized).not.toContain('--');
    });

    it('should detect unsafe strings with SQL injection patterns', () => {
      const sqlInjectionAttempts = [
        "' OR '1'='1",
        'UNION SELECT * FROM users',
        'DROP TABLE users',
        '; DELETE FROM users WHERE 1=1',
        'INSERT INTO users VALUES',
        'UPDATE users SET password',
      ];

      sqlInjectionAttempts.forEach((attempt) => {
        expect(securityService.isSafeString(attempt)).toBe(false);
      });
    });
  });

  describe('Input Sanitization', () => {
    it('should sanitize general string input', () => {
      const maliciousInput = '<script>alert("xss")</script>Hello\x00\x01World';
      const sanitized = securityService.sanitizeString(maliciousInput);

      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('\x00');
      expect(sanitized).not.toContain('\x01');
      expect(sanitized).toContain('Hello');
      expect(sanitized).toContain('World');
    });

    it('should handle null bytes and control characters', () => {
      const inputWithNullBytes = 'Hello\x00\x01\x02World\x7F';
      const sanitized = securityService.sanitizeString(inputWithNullBytes);

      expect(sanitized).toBe('HelloWorld');
      expect(sanitized).not.toContain('\x00');
      expect(sanitized).not.toContain('\x01');
      expect(sanitized).not.toContain('\x02');
      expect(sanitized).not.toContain('\x7F');
    });
  });

  describe('Year Validation', () => {
    it('should validate and sanitize valid years', () => {
      expect(securityService.validateAndSanitizeYear('2021')).toBe(2021);
      expect(securityService.validateAndSanitizeYear(2021)).toBe(2021);
      expect(securityService.validateAndSanitizeYear('1950')).toBe(1950);
    });

    it('should reject invalid years', () => {
      expect(() => securityService.validateAndSanitizeYear('1949')).toThrow(
        'Invalid year value',
      );
      expect(() => securityService.validateAndSanitizeYear('2050')).toThrow(
        'Invalid year value',
      );
      expect(() => securityService.validateAndSanitizeYear('abc')).toThrow(
        'Invalid year value',
      );
      expect(() => securityService.validateAndSanitizeYear(null)).toThrow(
        'Year is required',
      );
    });

    it('should sanitize malicious year input', () => {
      const maliciousYear = "2021'; DROP TABLE users; --";
      const result = securityService.validateAndSanitizeYear(maliciousYear);
      expect(result).toBe(2021);
    });
  });

  describe('Safe String Validation', () => {
    it('should allow safe F1-related strings', () => {
      const safeStrings = [
        'Lewis Hamilton',
        'Monaco Grand Prix',
        'verstappen',
        '2021',
        'Round 1',
        'Scuderia Ferrari',
        'Red Bull Racing',
        'Mercedes-AMG Petronas',
      ];

      safeStrings.forEach((str) => {
        expect(securityService.isSafeString(str)).toBe(true);
      });
    });

    it('should reject malicious strings', () => {
      const maliciousStrings = [
        '<script>alert("xss")</script>',
        "' OR '1'='1",
        'javascript:alert(1)',
        '<iframe src="malicious.com"></iframe>',
        'UNION SELECT password FROM users',
        'onload=alert(1)',
        '; DROP TABLE users',
        '-- SQL comment attack',
      ];

      maliciousStrings.forEach((str) => {
        const isSafe = securityService.isSafeString(str);
        if (isSafe) {
          console.log(
            `String "${str}" was considered safe but should be unsafe`,
          );
        }
        expect(securityService.isSafeString(str)).toBe(false);
      });
    });
  });

  describe('Security Event Logging', () => {
    it('should log security events with timestamp', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      securityService.logSecurityEvent('Test security event', {
        ip: '127.0.0.1',
        userAgent: 'Test Agent',
        suspiciousInput: 'malicious data',
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        '[SECURITY] Test security event',
        expect.objectContaining({
          timestamp: expect.any(String),
          ip: '127.0.0.1',
          userAgent: 'Test Agent',
          suspiciousInput: 'malicious data',
        }),
      );

      consoleSpy.mockRestore();
    });
  });
});
