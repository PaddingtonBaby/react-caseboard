export type EvidenceType = 'person' | 'location' | 'document' | 'item' | 'note' | 'photo';

export const CURRENT_SCHEMA_VERSION = 1;

export interface EvidenceCard {
  id: string;
  type: EvidenceType;
  title: string;
  description: string;
  imageUrl?: string;
  color?: string;
  position: { x: number; y: number };
  createdAt: number;
}

export interface EvidenceLink {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export interface Task {
  id: string;
  text: string;
  completed: boolean;
}

export type HistoryAction =
  | 'card_added'
  | 'card_deleted'
  | 'card_updated'
  | 'card_duplicated'
  | 'link_added'
  | 'link_deleted'
  | 'task_added'
  | 'task_completed'
  | 'task_deleted'
  | 'case_created';

export interface HistoryEntry {
  id: string;
  timestamp: number;
  action: HistoryAction;
  description: string;
}

export interface Case {
  id: string;
  name: string;
  description: string;
  cards: EvidenceCard[];
  links: EvidenceLink[];
  tasks: Task[];
  history: HistoryEntry[];
  createdAt: number;
  updatedAt: number;
}

export interface CaseExportSchema {
  schemaVersion: number;
  exportedAt: number;
  case: Case;
}

export interface ContextMenuState {
  isOpen: boolean;
  x: number;
  y: number;
  flowPosition?: { x: number; y: number };
}

