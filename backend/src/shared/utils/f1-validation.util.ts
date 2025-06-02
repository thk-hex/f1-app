import { BadRequestException } from '@nestjs/common';

export class F1ValidationUtil {
  private static readonly MIN_VALID_YEAR = 1950;

  static validateGpStartYear(startYear: number, throwBadRequest = false): void {
    const currentYear = new Date().getFullYear();

    if (startYear < this.MIN_VALID_YEAR) {
      const message = `GP_START_YEAR must be ${this.MIN_VALID_YEAR} or later. Formula 1 World Championship started in ${this.MIN_VALID_YEAR}.`;
      if (throwBadRequest) {
        throw new BadRequestException(message);
      } else {
        throw new Error(message);
      }
    }

    if (startYear > currentYear) {
      const message = `GP_START_YEAR cannot be greater than the current year (${currentYear}).`;
      if (throwBadRequest) {
        throw new BadRequestException(message);
      } else {
        throw new Error(message);
      }
    }
  }

  static validateBaseUrl(baseUrl: string | undefined): void {
    if (!baseUrl) {
      throw new Error('BASE_URL not configured in .env file');
    }

    // Additional URL validation for security
    if (!this.isValidUrl(baseUrl)) {
      throw new Error('Invalid BASE_URL format');
    }
  }

  static getMinValidYear(): number {
    return this.MIN_VALID_YEAR;
  }

  /**
   * Validates if a URL is safe and properly formatted
   * @param url - The URL to validate
   * @returns true if valid, false otherwise
   */
  static isValidUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      // Only allow http and https protocols
      return ['http:', 'https:'].includes(urlObj.protocol);
    } catch {
      return false;
    }
  }

  /**
   * Validates and sanitizes year parameter
   * @param year - The year to validate
   * @returns sanitized year number
   */
  static validateYear(year: any): number {
    let yearNum: number;

    if (typeof year === 'string') {
      // Remove any non-digit characters
      const cleaned = year.replace(/\D/g, '');
      yearNum = parseInt(cleaned, 10);
    } else if (typeof year === 'number') {
      yearNum = year;
    } else {
      throw new BadRequestException('Invalid year format');
    }

    if (isNaN(yearNum)) {
      throw new BadRequestException('Year must be a valid number');
    }

    if (yearNum < this.MIN_VALID_YEAR || yearNum > new Date().getFullYear()) {
      throw new BadRequestException(
        `Year must be between ${this.MIN_VALID_YEAR} and ${new Date().getFullYear()}`,
      );
    }

    return yearNum;
  }

  /**
   * Validates driver ID format
   * @param driverId - The driver ID to validate
   * @returns sanitized driver ID
   */
  static validateDriverId(driverId: string): string {
    if (!driverId || typeof driverId !== 'string') {
      throw new BadRequestException('Driver ID is required');
    }

    const cleaned = driverId.trim().toLowerCase();

    // Check format: only letters, numbers, underscores, and hyphens
    if (!/^[a-z0-9_-]+$/.test(cleaned)) {
      throw new BadRequestException(
        'Driver ID can only contain letters, numbers, underscores, and hyphens',
      );
    }

    if (cleaned.length < 1 || cleaned.length > 30) {
      throw new BadRequestException(
        'Driver ID must be between 1 and 30 characters',
      );
    }

    return cleaned;
  }

  /**
   * Validates driver name format
   * @param name - The name to validate
   * @param fieldName - The field name for error messages
   * @returns sanitized name
   */
  static validateDriverName(name: string, fieldName: string): string {
    if (!name || typeof name !== 'string') {
      throw new BadRequestException(`${fieldName} is required`);
    }

    const cleaned = name.trim();

    // Check format: only letters, spaces, hyphens, and apostrophes
    if (!/^[a-zA-Z\s'-]+$/.test(cleaned)) {
      throw new BadRequestException(
        `${fieldName} can only contain letters, spaces, hyphens, and apostrophes`,
      );
    }

    if (cleaned.length < 1 || cleaned.length > 50) {
      throw new BadRequestException(
        `${fieldName} must be between 1 and 50 characters`,
      );
    }

    return cleaned;
  }

  /**
   * Validates Grand Prix name format
   * @param gpName - The Grand Prix name to validate
   * @returns sanitized GP name
   */
  static validateGpName(gpName: string): string {
    if (!gpName || typeof gpName !== 'string') {
      throw new BadRequestException('Grand Prix name is required');
    }

    const cleaned = gpName.trim();

    // Check format: letters, numbers, spaces, hyphens, and apostrophes
    if (!/^[a-zA-Z0-9\s'-]+$/.test(cleaned)) {
      throw new BadRequestException(
        'Grand Prix name can only contain letters, numbers, spaces, hyphens, and apostrophes',
      );
    }

    if (cleaned.length < 1 || cleaned.length > 100) {
      throw new BadRequestException(
        'Grand Prix name must be between 1 and 100 characters',
      );
    }

    return cleaned;
  }

  /**
   * Validates round number format
   * @param round - The round to validate
   * @returns sanitized round number
   */
  static validateRound(round: string): string {
    if (!round || typeof round !== 'string') {
      throw new BadRequestException('Round is required');
    }

    const cleaned = round.trim();

    // Check format: 1-2 digit number
    if (!/^\d{1,2}$/.test(cleaned)) {
      throw new BadRequestException('Round must be a 1-2 digit number');
    }

    const roundNum = parseInt(cleaned, 10);
    if (roundNum < 1 || roundNum > 25) {
      throw new BadRequestException('Round must be between 1 and 25');
    }

    return cleaned;
  }
}
