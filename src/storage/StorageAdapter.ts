import type { Case } from '../types';

export interface StorageAdapter {
  loadAll(): Promise<Case[]>;
  saveCase(caseData: Case): Promise<void>;
  removeCase(caseId: string): Promise<void>;
  generateCaseId(existingCases: Case[]): string;
}
