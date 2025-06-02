import { Test, TestingModule } from '@nestjs/testing';
import { SecurityService } from './security.service';

describe('SecurityService', () => {
  let service: SecurityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SecurityService],
    }).compile();

    service = module.get<SecurityService>(SecurityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sanitizeHtml', () => {
    it('should remove script tags', () => {
      const input = '<script>alert("xss")</script>Hello';
      const result = service.sanitizeHtml(input);
      expect(result).toBe('Hello');
    });

    it('should remove iframe tags', () => {
      const input = '<iframe src="malicious.com"></iframe>Safe content';
      const result = service.sanitizeHtml(input);
      expect(result).toBe('Safe content');
    });

    it('should handle empty input', () => {
      expect(service.sanitizeHtml('')).toBe('');
      expect(service.sanitizeHtml(null as any)).toBe('');
      expect(service.sanitizeHtml(undefined as any)).toBe('');
    });

    it('should handle non-string input', () => {
      expect(service.sanitizeHtml(123 as any)).toBe('');
      expect(service.sanitizeHtml({} as any)).toBe('');
    });
  });

  describe('sanitizeSql', () => {
    it('should escape single quotes', () => {
      const input = "'; DROP TABLE users; --";
      const result = service.sanitizeSql(input);
      expect(result).toContain("''");
      expect(result).not.toContain(';');
      expect(result).not.toContain('--');
    });

    it('should remove SQL comments', () => {
      const input = 'SELECT * FROM users /* comment */ -- another comment';
      const result = service.sanitizeSql(input);
      expect(result).not.toContain('--');
      expect(result).not.toContain('/*');
      expect(result).not.toContain('*/');
    });

    it('should remove stored procedure calls', () => {
      const input = 'xp_cmdshell sp_configure';
      const result = service.sanitizeSql(input);
      expect(result).not.toContain('xp_');
      expect(result).not.toContain('sp_');
    });

    it('should handle empty input', () => {
      expect(service.sanitizeSql('')).toBe('');
      expect(service.sanitizeSql(null as any)).toBe('');
      expect(service.sanitizeSql(undefined as any)).toBe('');
    });
  });

  describe('sanitizeString', () => {
    it('should sanitize XSS attempts', () => {
      const input = '<script>alert("xss")</script>Hello';
      const result = service.sanitizeString(input);
      expect(result).not.toContain('<script>');
      expect(result).toContain('Hello');
    });

    it('should remove null bytes', () => {
      const input = 'Hello\x00World';
      const result = service.sanitizeString(input);
      expect(result).toBe('HelloWorld');
    });

    it('should remove control characters', () => {
      const input = 'Hello\x01\x02World';
      const result = service.sanitizeString(input);
      expect(result).toBe('HelloWorld');
    });

    it('should trim whitespace', () => {
      const input = '  Hello World  ';
      const result = service.sanitizeString(input);
      expect(result).toBe('Hello World');
    });
  });

  describe('isSafeString', () => {
    it('should detect script tags as unsafe', () => {
      const input = '<script>alert("xss")</script>';
      expect(service.isSafeString(input)).toBe(false);
    });

    it('should detect SQL injection patterns as unsafe', () => {
      const unsafe = [
        "' OR '1'='1",
        'UNION SELECT',
        'DROP TABLE',
        '; DELETE FROM users',
      ];

      unsafe.forEach((input) => {
        expect(service.isSafeString(input)).toBe(false);
      });
    });

    it('should allow safe strings', () => {
      const safe = [
        'Lewis Hamilton',
        'Monaco Grand Prix',
        'verstappen',
        '2021',
        'Round 1',
      ];

      safe.forEach((input) => {
        expect(service.isSafeString(input)).toBe(true);
      });
    });

    it('should handle empty input as safe', () => {
      expect(service.isSafeString('')).toBe(true);
      expect(service.isSafeString(null as any)).toBe(true);
      expect(service.isSafeString(undefined as any)).toBe(true);
    });
  });

  describe('validateAndSanitizeYear', () => {
    it('should validate and convert string years', () => {
      expect(service.validateAndSanitizeYear('2021')).toBe(2021);
      expect(service.validateAndSanitizeYear('1950')).toBe(1950);
    });

    it('should validate number years', () => {
      expect(service.validateAndSanitizeYear(2021)).toBe(2021);
      expect(service.validateAndSanitizeYear(1950)).toBe(1950);
    });

    it('should reject invalid years', () => {
      expect(() => service.validateAndSanitizeYear(1949)).toThrow();
      expect(() => service.validateAndSanitizeYear(2050)).toThrow();
      expect(() => service.validateAndSanitizeYear('invalid')).toThrow();
      expect(() => service.validateAndSanitizeYear(null)).toThrow();
    });

    it('should sanitize malicious input', () => {
      const maliciousYear = "2021'; DROP TABLE users; --";
      const result = service.validateAndSanitizeYear(maliciousYear);
      expect(result).toBe(2021);
    });
  });

  describe('logSecurityEvent', () => {
    it('should log security events', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      service.logSecurityEvent('Test event', { detail: 'test' });

      expect(consoleSpy).toHaveBeenCalledWith(
        '[SECURITY] Test event',
        expect.objectContaining({
          timestamp: expect.any(String),
          detail: 'test',
        }),
      );

      consoleSpy.mockRestore();
    });
  });
});
