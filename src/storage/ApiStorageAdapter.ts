import { v4 as uuidv4 } from 'uuid';
import type { Case } from '../types';
import type { StorageAdapter } from './StorageAdapter';

export class ApiStorageAdapter implements StorageAdapter {
  private baseUrl: string;
  private headers: Record<string, string>;

  constructor(baseUrl: string, headers: Record<string, string> = {}) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
    this.headers = headers;
  }

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...this.headers,
        ...init?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API ${init?.method ?? 'GET'} ${path}: ${response.status}`);
    }

    if (response.status === 204) return undefined as T;
    return response.json();
  }

  async loadAll(): Promise<Case[]> {
    return this.request<Case[]>('/cases');
  }

  async saveCase(caseData: Case): Promise<void> {
    await this.request(`/cases/${encodeURIComponent(caseData.id)}`, {
      method: 'PUT',
      body: JSON.stringify(caseData),
    });
  }

  async removeCase(caseId: string): Promise<void> {
    await this.request(`/cases/${encodeURIComponent(caseId)}`, {
      method: 'DELETE',
    });
  }

  generateCaseId(): string {
    return uuidv4();
  }
}
