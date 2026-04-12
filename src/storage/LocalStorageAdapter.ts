import localforage from 'localforage';
import type { Case } from '../types';
import type { StorageAdapter } from './StorageAdapter';

const CASE_KEY_PREFIX = 'case:';
const LEGACY_KEY = 'cases';

const store = localforage.createInstance({
  name: 'IAEvidenceBoard',
  storeName: 'cases',
});

export class LocalStorageAdapter implements StorageAdapter {
  async loadAll(): Promise<Case[]> {
    const legacyData = await store.getItem<Case[]>(LEGACY_KEY);

    if (legacyData && Array.isArray(legacyData)) {
      await Promise.all(
        legacyData.map((c) => store.setItem(`${CASE_KEY_PREFIX}${c.id}`, c)),
      );
      await store.removeItem(LEGACY_KEY);
      return legacyData;
    }

    const keys = await store.keys();
    const caseKeys = keys.filter((k) => k.startsWith(CASE_KEY_PREFIX));

    if (caseKeys.length === 0) return [];

    const cases = await Promise.all(
      caseKeys.map((key) => store.getItem<Case>(key)),
    );

    return cases
      .filter((c): c is Case => c !== null)
      .sort((a, b) => a.createdAt - b.createdAt);
  }

  async saveCase(caseData: Case): Promise<void> {
    await store.setItem(`${CASE_KEY_PREFIX}${caseData.id}`, caseData);
  }

  async removeCase(caseId: string): Promise<void> {
    await store.removeItem(`${CASE_KEY_PREFIX}${caseId}`);
  }

  generateCaseId(existingCases: Case[]): string {
    const maxNumber = existingCases.reduce((max, c) => {
      const match = c.id.match(/^IA-(\d+)$/);
      return match ? Math.max(max, parseInt(match[1], 10)) : max;
    }, 0);
    return `IA-${String(maxNumber + 1).padStart(4, '0')}`;
  }
}
