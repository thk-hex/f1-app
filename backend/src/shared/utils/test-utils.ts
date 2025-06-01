import { HttpRateLimiterUtil } from './http-rate-limiter.util';

export class TestUtils {
  /**
   * Creates a mock for HttpRateLimiterUtil.makeRateLimitedRequest
   * @param mockImplementation The mock implementation function
   */
  static mockHttpRateLimiterRequest(
    mockImplementation?: (httpService: any, url: string) => Promise<any>,
  ) {
    return jest
      .spyOn(HttpRateLimiterUtil, 'makeRateLimitedRequest')
      .mockImplementation(
        mockImplementation || jest.fn().mockResolvedValue({}),
      );
  }

  /**
   * Creates a mock for HttpRateLimiterUtil.makeRateLimitedRequestWithAxios
   * @param mockImplementation The mock implementation function
   */
  static mockHttpRateLimiterRequestWithAxios(
    mockImplementation?: (url: string) => Promise<any>,
  ) {
    return jest
      .spyOn(HttpRateLimiterUtil, 'makeRateLimitedRequestWithAxios')
      .mockImplementation(
        mockImplementation || jest.fn().mockResolvedValue({}),
      );
  }

  /**
   * Restores all mocked methods
   */
  static restoreAllMocks() {
    jest.restoreAllMocks();
  }
}
