/**
 * Tests for API client
 */

import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import apiClient, { apiRequest } from '../client';

describe('API Client', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(apiClient);
  });

  afterEach(() => {
    mock.restore();
  });

  describe('apiClient', () => {
    it('should make successful GET request', async () => {
      const responseData = { message: 'success' };
      mock.onGet('/test').reply(200, responseData);

      const response = await apiClient.get('/test');
      expect(response.data).toEqual(responseData);
    });

    it('should make successful POST request', async () => {
      const requestData = { name: 'test' };
      const responseData = { id: 1, ...requestData };
      mock.onPost('/test', requestData).reply(201, responseData);

      const response = await apiClient.post('/test', requestData);
      expect(response.data).toEqual(responseData);
    });

    it('should handle 404 errors', async () => {
      mock.onGet('/not-found').reply(404, {
        message: 'Not found',
        statusCode: 404,
      });

      await expect(apiClient.get('/not-found')).rejects.toMatchObject({
        statusCode: 404,
      });
    });

    it('should handle 500 errors', async () => {
      mock.onGet('/error').reply(500, {
        message: 'Internal server error',
        statusCode: 500,
      });

      await expect(apiClient.get('/error')).rejects.toMatchObject({
        statusCode: 500,
      });
    });

    it('should handle network errors', async () => {
      mock.onGet('/network-error').networkError();

      await expect(apiClient.get('/network-error')).rejects.toMatchObject({
        message: 'Network Error',
      });
    });

    it('should include auth token in headers if available', async () => {
      // Mock localStorage
      const localStorageMock = {
        getItem: jest.fn(() => 'test-token'),
      };
      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
        writable: true,
      });

      mock.onGet('/protected').reply((config) => {
        if (config.headers?.Authorization === 'Bearer test-token') {
          return [200, { authorized: true }];
        }
        return [401, { authorized: false }];
      });

      const response = await apiClient.get('/protected');
      expect(response.data).toEqual({ authorized: true });
      expect(localStorageMock.getItem).toHaveBeenCalledWith('auth_token');
    });
  });

  describe('apiRequest', () => {
    it('should make request and return data directly', async () => {
      const responseData = { message: 'success' };
      mock.onGet('/test').reply(200, responseData);

      const data = await apiRequest({ method: 'GET', url: '/test' });
      expect(data).toEqual(responseData);
    });

    it('should handle errors', async () => {
      mock.onGet('/error').reply(500, {
        message: 'Server error',
        statusCode: 500,
      });

      await expect(
        apiRequest({ method: 'GET', url: '/error' })
      ).rejects.toMatchObject({
        statusCode: 500,
      });
    });
  });
});
