import type { Case, CaseExportSchema } from '../types';
import { CURRENT_SCHEMA_VERSION } from '../types';

export type ImportResult =
  | { ok: true; caseData: Case }
  | { ok: false; error: string };

function isLikeCase(obj: unknown): obj is Case {
  if (!obj || typeof obj !== 'object') return false;
  const c = obj as Record<string, unknown>;
  return (
    typeof c.id === 'string' &&
    typeof c.name === 'string' &&
    Array.isArray(c.cards) &&
    Array.isArray(c.links)
  );
}

function migrateV0(raw: unknown): ImportResult {
  if (!isLikeCase(raw)) {
    return { ok: false, error: 'Не удалось разобрать файл: структура не соответствует схеме дела' };
  }
  return { ok: true, caseData: raw };
}

function validateV1(schema: CaseExportSchema): ImportResult {
  if (!schema.case) {
    return { ok: false, error: 'Схема v1: отсутствует поле case' };
  }
  if (!isLikeCase(schema.case)) {
    return { ok: false, error: 'Схема v1: поле case содержит невалидные данные' };
  }
  return { ok: true, caseData: schema.case };
}

export function parseImportJson(json: string): ImportResult {
  let raw: unknown;
  try {
    raw = JSON.parse(json);
  } catch {
    return { ok: false, error: 'Невалидный JSON' };
  }

  if (!raw || typeof raw !== 'object') {
    return { ok: false, error: 'Ожидался объект' };
  }

  const obj = raw as Record<string, unknown>;

  if (obj.schemaVersion === undefined) {
    return migrateV0(raw);
  }

  const version = obj.schemaVersion;

  if (typeof version !== 'number') {
    return { ok: false, error: 'schemaVersion должен быть числом' };
  }

  if (version > CURRENT_SCHEMA_VERSION) {
    return {
      ok: false,
      error: `Файл создан в более новой версии (схема ${version}), обновите приложение`,
    };
  }

  if (version === 1) {
    return validateV1(raw as CaseExportSchema);
  }

  // На будущее, пока других версий нет
  return { ok: false, error: `Неизвестная версия схемы: ${version}` };
}
