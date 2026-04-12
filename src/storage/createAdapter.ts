import type { StorageAdapter } from './StorageAdapter';
import { LocalStorageAdapter } from './LocalStorageAdapter';
import { ApiStorageAdapter } from './ApiStorageAdapter';

export function createStorageAdapter(): StorageAdapter {
  const apiUrl = import.meta.env.VITE_API_URL;

  if (apiUrl) {
    return new ApiStorageAdapter(apiUrl);
  }

  return new LocalStorageAdapter();
}
