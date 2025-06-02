import { F1ValidationUtil } from './f1-validation.util';

export interface F1DataProcessorOptions {
  baseUrl: string;
  startYear: number;
  onProgress?: (year: number, total: number, current: number) => void;
  onError?: (year: number, error: Error) => void;
}

export class F1DataProcessorUtil {
  static async processYearsSequentially<T>(
    options: F1DataProcessorOptions,
    processor: (year: number, apiUrl: string) => Promise<T | null>,
  ): Promise<T[]> {
    const { baseUrl, startYear, onProgress, onError } = options;

    F1ValidationUtil.validateBaseUrl(baseUrl);
    F1ValidationUtil.validateGpStartYear(startYear);

    const currentYear = new Date().getFullYear();
    const results: T[] = [];
    const totalYears = currentYear - startYear + 1;

    for (let year = startYear; year <= currentYear; year++) {
      const apiUrl = `${baseUrl}/${year}/driverstandings/1.json`;
      const currentIndex = year - startYear + 1;

      try {
        onProgress?.(year, totalYears, currentIndex);

        const result = await processor(year, apiUrl);
        if (result) {
          results.push(result);
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error : new Error(String(error));
        onError?.(year, errorMessage);
      }
    }

    return results;
  }

  static getYearRange(startYear: number): {
    startYear: number;
    endYear: number;
    totalYears: number;
  } {
    const endYear = new Date().getFullYear();
    return {
      startYear,
      endYear,
      totalYears: endYear - startYear + 1,
    };
  }
}
