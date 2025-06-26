import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import axios, { AxiosResponse } from 'axios';

export interface RateLimitedRequestOptions {
  defaultDelayMs?: number;
  retryOnRateLimit?: boolean;
  httpService?: HttpService; // Optional: if provided, uses NestJS HttpService, otherwise uses axios
}

export class HttpRateLimiterUtil {
  private static readonly DEFAULT_DELAY_MS = 250; // 4 requests per second

  static async makeRateLimitedRequest(
    url: string,
    options: RateLimitedRequestOptions = {},
  ): Promise<any> {
    const { 
      defaultDelayMs = this.DEFAULT_DELAY_MS, 
      retryOnRateLimit = true,
      httpService 
    } = options;

    try {
      let responseData: any;
      let responseHeaders: any;

      if (httpService) {
        // Use NestJS HttpService
        const response = await firstValueFrom(httpService.get(url));
        responseData = response.data;
        responseHeaders = response.headers;
      } else {
        // Use axios directly
        const response: AxiosResponse = await axios.get(url);
        responseData = response.data;
        responseHeaders = response.headers;
      }

      // Apply consistent rate limiting logic for both cases
      await this.applyRateLimit(responseHeaders, defaultDelayMs);

      return responseData;
    } catch (error) {
      if (retryOnRateLimit && this.isRateLimitError(error)) {
        const waitTimeMs = this.extractRetryDelay(error) * 1000;

        console.log(
          `Rate limit hit, waiting for ${waitTimeMs}ms before retrying...`,
        );
        await this.delay(waitTimeMs);

        return this.makeRateLimitedRequest(url, options);
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
