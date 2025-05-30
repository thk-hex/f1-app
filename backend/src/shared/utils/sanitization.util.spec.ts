import { SanitizationUtil } from './sanitization.util';

describe('SanitizationUtil', () => {
  describe('sanitizeString', () => {
    it('should remove script tags', () => {
      const maliciousInput = '<script>alert("XSS")</script>Hello World';
      const result = SanitizationUtil.sanitizeString(maliciousInput);
      expect(result).not.toContain('<script>');
      expect(result).not.toContain('alert');
    });

    it('should escape XSS characters', () => {
      const maliciousInput = '<img src="x" onerror="alert(1)">';
      const result = SanitizationUtil.sanitizeString(maliciousInput);
      expect(result).not.toContain('<img');
      expect(result).not.toContain('onerror');
    });

    it('should handle maximum length', () => {
      const longInput = 'a'.repeat(1000);
      const result = SanitizationUtil.sanitizeString(longInput, { maxLength: 10 });
      expect(result.length).toBe(10);
    });

    it('should trim whitespace by default', () => {
      const input = '  hello world  ';
      const result = SanitizationUtil.sanitizeString(input);
      expect(result).toBe('hello world');
    });
  });

  describe('validateTextContent', () => {
    it('should detect script tags', () => {
      const maliciousInput = '<script>alert("XSS")</script>';
      const result = SanitizationUtil.validateTextContent(maliciousInput);
      expect(result.isValid).toBe(false);
      expect(result.issues).toContain('Contains script tags');
    });

    it('should detect JavaScript event handlers', () => {
      const maliciousInput = '<div onclick="alert(1)">Click me</div>';
      const result = SanitizationUtil.validateTextContent(maliciousInput);
      expect(result.isValid).toBe(false);
      expect(result.issues).toContain('Contains JavaScript event handlers');
    });

    it('should detect SQL injection patterns', () => {
      const sqlInjection = "'; DROP TABLE users; --";
      const result = SanitizationUtil.validateTextContent(sqlInjection);
      expect(result.isValid).toBe(false);
      expect(result.issues).toContain('Contains potential SQL injection patterns');
    });

    it('should detect UNION SELECT attacks', () => {
      const sqlInjection = "1 UNION SELECT password FROM users";
      const result = SanitizationUtil.validateTextContent(sqlInjection);
      expect(result.isValid).toBe(false);
      expect(result.issues).toContain('Contains potential SQL injection patterns');
    });

    it('should detect path traversal', () => {
      const pathTraversal = '../../../etc/passwd';
      const result = SanitizationUtil.validateTextContent(pathTraversal);
      expect(result.isValid).toBe(false);
      expect(result.issues).toContain('Contains path traversal patterns');
    });

    it('should detect command injection', () => {
      const commandInjection = 'test; rm -rf /';
      const result = SanitizationUtil.validateTextContent(commandInjection);
      expect(result.isValid).toBe(false);
      expect(result.issues).toContain('Contains potential command injection patterns');
    });

    it('should pass valid content', () => {
      const validInput = 'Lewis Hamilton 2021';
      const result = SanitizationUtil.validateTextContent(validInput);
      expect(result.isValid).toBe(true);
      expect(result.issues).toHaveLength(0);
    });
  });

  describe('sanitizeObject', () => {
    it('should sanitize nested objects', () => {
      const maliciousObject = {
        name: '<script>alert("XSS")</script>Lewis',
        details: {
          team: '<img src="x" onerror="alert(1)">Mercedes',
          year: 2021
        }
      };
      
      const result = SanitizationUtil.sanitizeObject(maliciousObject);
      expect(result.name).not.toContain('<script>');
      expect(result.details.team).not.toContain('<img');
      expect(result.details.year).toBe(2021);
    });

    it('should handle arrays', () => {
      const maliciousArray = [
        '<script>alert("XSS")</script>',
        'normal text',
        { nested: '<img src="x" onerror="alert(1)">' }
      ];
      
      const result = SanitizationUtil.sanitizeObject(maliciousArray);
      expect(result[0]).not.toContain('<script>');
      expect(result[1]).toBe('normal text');
      expect(result[2].nested).not.toContain('<img');
    });
  });

  describe('validateAndSanitize', () => {
    it('should validate and sanitize text', () => {
      const maliciousText = '<script>alert("XSS")</script>Hello';
      const result = SanitizationUtil.validateAndSanitize(maliciousText, 'text');
      expect(result).not.toContain('<script>');
    });

    it('should validate numbers', () => {
      expect(SanitizationUtil.validateAndSanitize('2021', 'number')).toBe(2021);
      expect(SanitizationUtil.validateAndSanitize('invalid', 'number')).toBeNull();
    });

    it('should validate emails', () => {
      expect(SanitizationUtil.validateAndSanitize('test@example.com', 'email')).toBe('test@example.com');
      expect(SanitizationUtil.validateAndSanitize('invalid-email', 'email')).toBeNull();
    });

    it('should sanitize alphanumeric', () => {
      const result = SanitizationUtil.validateAndSanitize('abc123!@#', 'alphanumeric');
      expect(result).toBe('abc123');
    });

    it('should sanitize identifiers', () => {
      const result = SanitizationUtil.validateAndSanitize('test_id-123!@#', 'identifier');
      expect(result).toBe('test_id-123');
    });
  });

  describe('isSafeIdentifier', () => {
    it('should accept safe identifiers', () => {
      expect(SanitizationUtil.isSafeIdentifier('hamilton')).toBe(true);
      expect(SanitizationUtil.isSafeIdentifier('test_123')).toBe(true);
      expect(SanitizationUtil.isSafeIdentifier('test-id')).toBe(true);
    });

    it('should reject unsafe identifiers', () => {
      expect(SanitizationUtil.isSafeIdentifier('test@example')).toBe(false);
      expect(SanitizationUtil.isSafeIdentifier('test space')).toBe(false);
      expect(SanitizationUtil.isSafeIdentifier('test/path')).toBe(false);
    });
  });

  describe('sanitizeFilename', () => {
    it('should remove dangerous characters', () => {
      const dangerousFilename = '../../../etc/passwd';
      const result = SanitizationUtil.sanitizeFilename(dangerousFilename);
      expect(result).not.toContain('../');
      expect(result).not.toContain('/');
    });

    it('should handle long filenames', () => {
      const longFilename = 'a'.repeat(300) + '.txt';
      const result = SanitizationUtil.sanitizeFilename(longFilename);
      expect(result.length).toBeLessThanOrEqual(255);
      expect(result).toMatch(/\.txt$/);
    });

    it('should return default for empty input', () => {
      expect(SanitizationUtil.sanitizeFilename('')).toBe('unnamed');
      expect(SanitizationUtil.sanitizeFilename(null as any)).toBe('unnamed');
    });
  });
}); 