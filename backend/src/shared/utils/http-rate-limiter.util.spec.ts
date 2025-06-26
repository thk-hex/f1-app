import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';
import axios from 'axios';
import { HttpRateLimiterUtil } from './http-rate-limiter.util';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('HttpRateLimiterUtil', () => {
  let httpService: jest.Mocked<HttpService>;

  beforeEach(() => {
    httpService = {
      get: jest.fn(),
    } as any;

    jest.clearAllMocks();
  });

  describe('makeRateLimitedRequest (unified method)', () => {
    describe('with NestJS HttpService', () => {
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
          'test-url',
          { httpService },
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
          'test-url',
          { httpService },
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

        const result = await HttpRateLimiterUtil.makeRateLimitedRequest(
          'test-url',
          { httpService },
        );

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
          HttpRateLimiterUtil.makeRateLimitedRequest('test-url', {
            httpService,
          }),
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

        await HttpRateLimiterUtil.makeRateLimitedRequest('test-url', {
          httpService,
          defaultDelayMs: 500,
        });

        expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 500);

        setTimeoutSpy.mockRestore();
      });
    });

    describe('with standalone axios', () => {
      it('should handle rate limiting with axios and apply header-based delays', async () => {
        const mockData = { test: 'data' };
        const mockResponse = {
          data: mockData,
          headers: { 'retry-after': '2' },
        };

        mockedAxios.get.mockResolvedValue(mockResponse);

        const setTimeoutSpy = jest
          .spyOn(global, 'setTimeout')
          .mockImplementation((fn: any) => {
            fn();
            return null as any;
          });

        const result =
          await HttpRateLimiterUtil.makeRateLimitedRequest('test-url');

        expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 2000); // 2 seconds from retry-after header
        expect(result).toEqual(mockData);

        setTimeoutSpy.mockRestore();
      });

      it('should apply default delay when no headers present', async () => {
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
          await HttpRateLimiterUtil.makeRateLimitedRequest('test-url');

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

        mockedAxios.get
          .mockRejectedValueOnce(mockError)
          .mockResolvedValueOnce({ data: mockData, headers: {} });

        const setTimeoutSpy = jest
          .spyOn(global, 'setTimeout')
          .mockImplementation((fn: any) => {
            fn();
            return null as any;
          });

        const result =
          await HttpRateLimiterUtil.makeRateLimitedRequest('test-url');

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
          HttpRateLimiterUtil.makeRateLimitedRequest('test-url'),
        ).rejects.toEqual(mockError);
      });
    });
  });
});
