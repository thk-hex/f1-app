import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';
import axios from 'axios';
import { HttpRateLimiterUtil } from './http-rate-limiter.util';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('HttpRateLimiterUtil', () => {
  let httpService: jest.Mocked<HttpService>;

  beforeEach(() => {
    httpService = {
      get: jest.fn(),
    } as any;

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('makeRateLimitedRequest (NestJS HttpService)', () => {
    it('should handle rate limiting using retry-after header', async () => {
      const mockData = { test: 'data' };
      const mockResponse = {
        data: mockData,
        headers: { 'retry-after': '1' },
        status: 200,
        statusText: 'OK',
        config: {} as any,
      };

      httpService.get.mockReturnValue(of(mockResponse));

      const setTimeoutSpy = jest
        .spyOn(global, 'setTimeout')
        .mockImplementation((fn: any) => {
          fn();
          return null as any;
        });

      const result = await HttpRateLimiterUtil.makeRateLimitedRequest(
        httpService,
        'test-url',
      );

      expect(setTimeoutSpy).toHaveBeenCalled();
      expect(result).toEqual(mockData);

      setTimeoutSpy.mockRestore();
    });

    it('should retry on 429 errors', async () => {
      const mockData = { test: 'data' };
      const mockError = {
        response: {
          status: 429,
          headers: { 'retry-after': '1' },
        },
      };

      // First call fails with 429, second call succeeds
      httpService.get
        .mockReturnValueOnce(throwError(() => mockError))
        .mockReturnValueOnce(
          of({
            data: mockData,
            headers: {},
            status: 200,
            statusText: 'OK',
            config: {} as any,
          }),
        );

      const setTimeoutSpy = jest
        .spyOn(global, 'setTimeout')
        .mockImplementation((fn: any) => {
          fn();
          return null as any;
        });

      const result = await HttpRateLimiterUtil.makeRateLimitedRequest(
        httpService,
        'test-url',
      );

      expect(httpService.get).toHaveBeenCalledTimes(2);
      expect(setTimeoutSpy).toHaveBeenCalled();
      expect(result).toEqual(mockData);

      setTimeoutSpy.mockRestore();
    });

    it('should apply default rate limiting even without headers', async () => {
      const mockData = { test: 'data' };
      const mockResponse = {
        data: mockData,
        headers: {}, // No rate limiting headers
        status: 200,
        statusText: 'OK',
        config: {} as any,
      };

      httpService.get.mockReturnValue(of(mockResponse));

      const setTimeoutSpy = jest
        .spyOn(global, 'setTimeout')
        .mockImplementation((fn: any) => {
          fn();
          return null as any;
        });

      const result = await HttpRateLimiterUtil.makeRateLimitedRequest(
        httpService,
        'test-url',
      );

      // Should still apply default 250ms rate limiting
      expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 250);
      expect(result).toEqual(mockData);

      setTimeoutSpy.mockRestore();
    });

    it('should handle non-429 errors by rethrowing them', async () => {
      const mockError = {
        response: {
          status: 500,
          statusText: 'Internal Server Error',
        },
      };

      httpService.get.mockReturnValue(throwError(() => mockError));

      await expect(
        HttpRateLimiterUtil.makeRateLimitedRequest(httpService, 'test-url'),
      ).rejects.toEqual(mockError);
    });

    it('should use custom delay options', async () => {
      const mockData = { test: 'data' };
      const mockResponse = {
        data: mockData,
        headers: {},
        status: 200,
        statusText: 'OK',
        config: {} as any,
      };

      httpService.get.mockReturnValue(of(mockResponse));

      const setTimeoutSpy = jest
        .spyOn(global, 'setTimeout')
        .mockImplementation((fn: any) => {
          fn();
          return null as any;
        });

      await HttpRateLimiterUtil.makeRateLimitedRequest(
        httpService,
        'test-url',
        { defaultDelayMs: 500 },
      );

      expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 500);

      setTimeoutSpy.mockRestore();
    });
  });

  describe('makeRateLimitedRequestWithAxios (standalone scripts)', () => {
    it('should handle rate limiting with axios', async () => {
      const mockData = { test: 'data' };
      const mockResponse = {
        data: mockData,
        headers: {},
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const setTimeoutSpy = jest
        .spyOn(global, 'setTimeout')
        .mockImplementation((fn: any) => {
          fn();
          return null as any;
        });

      const result =
        await HttpRateLimiterUtil.makeRateLimitedRequestWithAxios('test-url');

      expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 250);
      expect(result).toEqual(mockData);

      setTimeoutSpy.mockRestore();
    });

    it('should retry on 429 errors with axios', async () => {
      const mockData = { test: 'data' };
      const mockError = {
        response: {
          status: 429,
          headers: { 'retry-after': '1' },
        },
      };

      // First call fails with 429, second call succeeds
      mockedAxios.get
        .mockRejectedValueOnce(mockError)
        .mockResolvedValueOnce({ data: mockData });

      const setTimeoutSpy = jest
        .spyOn(global, 'setTimeout')
        .mockImplementation((fn: any) => {
          fn();
          return null as any;
        });

      const result =
        await HttpRateLimiterUtil.makeRateLimitedRequestWithAxios('test-url');

      expect(mockedAxios.get).toHaveBeenCalledTimes(2);
      expect(setTimeoutSpy).toHaveBeenCalled();
      expect(result).toEqual(mockData);

      setTimeoutSpy.mockRestore();
    });

    it('should handle non-429 errors by rethrowing them with axios', async () => {
      const mockError = {
        response: {
          status: 500,
          statusText: 'Internal Server Error',
        },
      };

      mockedAxios.get.mockRejectedValue(mockError);

      await expect(
        HttpRateLimiterUtil.makeRateLimitedRequestWithAxios('test-url'),
      ).rejects.toEqual(mockError);
    });

    it('should disable retry on rate limit when configured', async () => {
      const mockError = {
        response: {
          status: 429,
          headers: { 'retry-after': '1' },
        },
      };

      mockedAxios.get.mockRejectedValue(mockError);

      await expect(
        HttpRateLimiterUtil.makeRateLimitedRequestWithAxios('test-url', {
          retryOnRateLimit: false,
        }),
      ).rejects.toEqual(mockError);

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });
  });
});
