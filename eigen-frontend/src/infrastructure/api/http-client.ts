import axios, { AxiosError } from 'axios';
import { ApiErrorResponse } from '../dtos/api.dtos';

const apiBaseUrl =
  (typeof process !== 'undefined' && process.env?.VITE_API_URL) || '/api';

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    if (error.response?.data) {
      const data = error.response.data;
      const message = Array.isArray(data.message)
        ? data.message.join(', ')
        : data.message || error.message;
      return Promise.reject(new Error(message));
    }
    if (error.request) {
      return Promise.reject(
        new Error('Unable to connect to the backend server. Please verify the service is running.')
      );
    }
    return Promise.reject(error);
  }
);
