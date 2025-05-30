import { apiClient, handleApiError } from '@/lib/axios';
import type { AxiosRequestConfig } from 'axios';

// Base service class for common API operations
export class BaseService {
  protected endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  // Generic GET request
  protected async get<T>(path: string = '', config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await apiClient.get(`${this.endpoint}${path}`, config);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  }

  // Generic POST request
  protected async post<T>(data: any, path: string = '', config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await apiClient.post(`${this.endpoint}${path}`, data, config);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  }

  // Generic PUT request
  protected async put<T>(data: any, path: string = '', config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await apiClient.put(`${this.endpoint}${path}`, data, config);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  }

  // Generic PATCH request
  protected async patch<T>(data: any, path: string = '', config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await apiClient.patch(`${this.endpoint}${path}`, data, config);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  }

  // Generic DELETE request
  protected async delete<T>(path: string = '', config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await apiClient.delete(`${this.endpoint}${path}`, config);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  }
}

// Example of how to extend the base service
// export class PatientService extends BaseService {
//   constructor() {
//     super('/patients');
//   }
//
//   async getPatients() {
//     return this.get<Patient[]>('/');
//   }
//
//   async getPatient(id: string) {
//     return this.get<Patient>(`/${id}`);
//   }
//
//   async createPatient(data: CreatePatientData) {
//     return this.post<Patient>(data, '/');
//   }
//
//   async updatePatient(id: string, data: UpdatePatientData) {
//     return this.put<Patient>(data, `/${id}`);
//   }
//
//   async deletePatient(id: string) {
//     return this.delete(`/${id}`);
//   }
// } 