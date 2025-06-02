import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import axios, { AxiosResponse } from 'axios';

export interface RateLimitedRequestOptions {
  defaultDelayMs?: number;
  retryOnRateLimit?: boolean;
}

export class HttpRateLimiterUtil {
  private static readonly DEFAULT_DELAY_MS = 250; // 4 requests per second

  static async makeRateLimitedRequest(
    httpService: HttpService,
    url: string,
    options: RateLimitedRequestOptions = {},
  ): Promise<any> {
    const { defaultDelayMs = this.DEFAULT_DELAY_MS, retryOnRateLimit = true } =
      options;

    try {
      const response = await firstValueFrom(httpService.get(url));

      const data = response.data;
      const headers = response.headers;

      await this.applyRateLimit(headers, defaultDelayMs);

      return data;
    } catch (error) {
      if (retryOnRateLimit && this.isRateLimitError(error)) {
        const waitTimeMs = this.extractRetryDelay(error) * 1000;

        console.log(
          `Rate limit hit, waiting for ${waitTimeMs}ms before retrying...`,
        );
        await this.delay(waitTimeMs);

        return this.makeRateLimitedRequest(httpService, url, options);
      }

      throw error;
    }
  }

  static async makeRateLimitedRequestWithAxios(
    url: string,
    options: RateLimitedRequestOptions = {},
  ): Promise<any> {
    const { defaultDelayMs = this.DEFAULT_DELAY_MS, retryOnRateLimit = true } =
      options;

    try {
      const response: AxiosResponse = await axios.get(url);

      await this.delay(defaultDelayMs);

      return response.data;
    } catch (error: any) {
      if (retryOnRateLimit && this.isRateLimitError(error)) {
        const waitTimeMs = this.extractRetryDelay(error) * 1000;

        console.log(
          `Rate limit hit, waiting for ${waitTimeMs}ms before retrying...`,
        );
        await this.delay(waitTimeMs);

        return this.makeRateLimitedRequestWithAxios(url, options);
      }

      throw error;
    }
  }

  private static async applyRateLimit(
    headers: any,
    defaultDelayMs: number,
  ): Promise<void> {
    const retryAfter = headers['retry-after'] || headers['x-ratelimit-reset'];

    if (retryAfter) {
      const waitTimeMs = parseInt(retryAfter, 10) * 1000;
      await this.delay(waitTimeMs);
    } else {
      await this.delay(defaultDelayMs);
    }
  }

  private static isRateLimitError(error: any): boolean {
    return error.response && error.response.status === 429;
  }

  private static extractRetryDelay(error: any): number {
    const retryAfter =
      error.response?.headers?.['retry-after'] ||
      error.response?.headers?.['x-ratelimit-reset'] ||
      1;
    return parseInt(retryAfter, 10);
  }

  private static delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
