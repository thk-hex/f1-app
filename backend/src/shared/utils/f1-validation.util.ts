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
  }

  static getMinValidYear(): number {
    return this.MIN_VALID_YEAR;
  }
}
