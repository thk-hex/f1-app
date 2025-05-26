import { BadRequestException } from '@nestjs/common';

export class F1ValidationUtil {
  private static readonly MIN_VALID_YEAR = 1950;

  /**
   * Validates that the GP start year is within valid bounds
   * @param startYear The year to validate
   * @param throwBadRequest Whether to throw BadRequestException (for services) or Error (for scripts)
   */
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

  /**
   * Validates that the base URL is configured
   * @param baseUrl The base URL to validate
   */
  static validateBaseUrl(baseUrl: string | undefined): void {
    if (!baseUrl) {
      throw new Error('BASE_URL not configured in .env file');
    }
  }

  /**
   * Gets the minimum valid year for F1 data
   */
  static getMinValidYear(): number {
    return this.MIN_VALID_YEAR;
  }
}
