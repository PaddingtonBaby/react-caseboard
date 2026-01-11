export type EvidenceType = 'person' | 'location' | 'document' | 'item' | 'note' | 'photo';

export interface EvidenceCard {
  id: string;
  type: EvidenceType;
  title: string;
  description: string;
  imageUrl?: string;
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

export interface Case {
  id: string;
  name: string;
  description: string;
  cards: EvidenceCard[];
  links: EvidenceLink[];
  tasks: Task[];
  createdAt: number;
  updatedAt: number;
}

export interface ContextMenuState {
  isOpen: boolean;
  x: number;
  y: number;
  flowPosition?: { x: number; y: number };
}

