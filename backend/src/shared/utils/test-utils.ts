import { HttpRateLimiterUtil } from './http-rate-limiter.util';

export class TestUtils {
  static mockHttpRateLimiterRequest(
    mockImplementation?: (httpService: any, url: string) => Promise<any>,
  ) {
    return jest
      .spyOn(HttpRateLimiterUtil, 'makeRateLimitedRequest')
      .mockImplementation(
        mockImplementation || jest.fn().mockResolvedValue({}),
      );
  }

  static mockHttpRateLimiterRequestWithAxios(
    mockImplementation?: (url: string) => Promise<any>,
  ) {
    return jest
      .spyOn(HttpRateLimiterUtil, 'makeRateLimitedRequestWithAxios')
      .mockImplementation(
        mockImplementation || jest.fn().mockResolvedValue({}),
      );
  }

  static restoreAllMocks() {
    jest.restoreAllMocks();
  }
}
