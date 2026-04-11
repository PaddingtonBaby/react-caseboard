import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import localforage from 'localforage';
import type { Case, EvidenceCard, EvidenceLink, EvidenceType, ContextMenuState, Task, HistoryEntry, HistoryAction } from '../types';

localforage.config({
  name: 'IAEvidenceBoard',
  storeName: 'cases',
});

const makeHistoryEntry = (action: HistoryAction, description: string): HistoryEntry => ({
  id: uuidv4(),
  timestamp: Date.now(),
  action,
  description,
});

interface StoreState {
  cases: Case[];
  activeCaseId: string | null;
  selectedCardId: string | null;
  contextMenu: ContextMenuState;
  isImportExportOpen: boolean;
  zoom: number;

  initializeStore: () => Promise<void>;
  setActiveCase: (id: string) => void;
  createCase: (name: string, description: string) => void;
  
  addCard: (type: EvidenceType, position: { x: number; y: number }) => void;
  updateCard: (id: string, updates: Partial<EvidenceCard>) => void;
  deleteCard: (id: string) => void;
  duplicateCard: (id: string) => void;
  updateCardPosition: (id: string, position: { x: number; y: number }) => void;
  selectCard: (id: string | null) => void;
  
  addLink: (source: string, target: string) => void;
  deleteLink: (id: string) => void;
  
  addTask: (text: string) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  
  openContextMenu: (x: number, y: number, flowPosition?: { x: number; y: number }) => void;
  closeContextMenu: () => void;
  
  setImportExportOpen: (isOpen: boolean) => void;
  exportCase: () => string | null;
  importCase: (json: string) => boolean;
  
  setZoom: (zoom: number) => void;
  
  saveToStorage: () => Promise<void>;
}

const getDefaultCase = (): Case => ({
  id: 'IA-0001',
  name: 'IA-0001',
  description: 'Расследование внутренних дел - Дело №0001',
  cards: [],
  links: [],
  tasks: [
    { id: uuidv4(), text: 'Собрать первичные улики', completed: false },
    { id: uuidv4(), text: 'Определить ключевых лиц', completed: false },
    { id: uuidv4(), text: 'Составить карту локаций', completed: false },
  ],
  history: [makeHistoryEntry('case_created', 'Дело создано')],
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

const getDefaultTitle = (type: EvidenceType): string => {
  const titles: Record<EvidenceType, string> = {
    person: 'Незнакомец',
    location: 'Локация',
    document: 'Документ',
    item: 'Вещдок',
    note: 'Заметка',
    photo: 'Фото улики',
  };
  return titles[type];
};

export const useStore = create<StoreState>((set, get) => ({
  cases: [],
  activeCaseId: null,
  selectedCardId: null,
  contextMenu: { isOpen: false, x: 0, y: 0 },
  isImportExportOpen: false,
  zoom: 1,

  initializeStore: async () => {
    try {
      const savedCases = await localforage.getItem<Case[]>('cases');
      if (savedCases && savedCases.length > 0) {
        set({ cases: savedCases, activeCaseId: savedCases[0].id });
      } else {
        const defaultCase = getDefaultCase();
        set({ cases: [defaultCase], activeCaseId: defaultCase.id });
        await localforage.setItem('cases', [defaultCase]);
      }
    } catch {
      const defaultCase = getDefaultCase();
      set({ cases: [defaultCase], activeCaseId: defaultCase.id });
    }
  },

  setActiveCase: (id) => set({ activeCaseId: id, selectedCardId: null }),

  createCase: (name, description) => {
    const entry = makeHistoryEntry('case_created', `Дело создано: ${name}`);
    const newCase: Case = {
      id: `IA-${String(get().cases.length + 1).padStart(4, '0')}`,
      name,
      description,
      cards: [],
      links: [],
      tasks: [],
      history: [entry],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    set((state) => ({ cases: [...state.cases, newCase], activeCaseId: newCase.id }));
    get().saveToStorage();
  },

  addCard: (type, position) => {
    const newCard: EvidenceCard = {
      id: uuidv4(),
      type,
      title: type === 'note' ? '' : getDefaultTitle(type),
      description: '',
      position,
      createdAt: Date.now(),
    };
    const entry = makeHistoryEntry('card_added', `Добавлена карточка: ${newCard.title || getDefaultTitle(newCard.type)}`);
    set((state) => ({
      cases: state.cases.map((c) =>
        c.id === state.activeCaseId
          ? { ...c, cards: [...c.cards, newCard], history: [...(c.history ?? []), entry], updatedAt: Date.now() }
          : c
      ),
    }));
    get().saveToStorage();
  },

  updateCard: (id, updates) => {
    const activeCase = get().cases.find((c) => c.id === get().activeCaseId);
    const card = activeCase?.cards.find((c) => c.id === id);
    const isSignificant = updates.title !== undefined || updates.description !== undefined || updates.imageUrl !== undefined;
    const entry = isSignificant
      ? makeHistoryEntry('card_updated', `Обновлена карточка: ${updates.title ?? card?.title ?? id}`)
      : null;
    set((state) => ({
      cases: state.cases.map((c) =>
        c.id === state.activeCaseId
          ? {
              ...c,
              cards: c.cards.map((card) =>
                card.id === id ? { ...card, ...updates } : card
              ),
              history: entry ? [...(c.history ?? []), entry] : (c.history ?? []),
              updatedAt: Date.now(),
            }
          : c
      ),
    }));
    get().saveToStorage();
  },

  deleteCard: (id) => {
    const activeCase = get().cases.find((c) => c.id === get().activeCaseId);
    const card = activeCase?.cards.find((c) => c.id === id);
    const entry = makeHistoryEntry('card_deleted', `Удалена карточка: ${card?.title || (card ? getDefaultTitle(card.type) : id)}`);
    set((state) => ({
      cases: state.cases.map((c) =>
        c.id === state.activeCaseId
          ? {
              ...c,
              cards: c.cards.filter((card) => card.id !== id),
              links: c.links.filter((link) => link.source !== id && link.target !== id),
              history: [...(c.history ?? []), entry],
              updatedAt: Date.now(),
            }
          : c
      ),
      selectedCardId: state.selectedCardId === id ? null : state.selectedCardId,
    }));
    get().saveToStorage();
  },

  duplicateCard: (id) => {
    const activeCase = get().cases.find((c) => c.id === get().activeCaseId);
    if (!activeCase) return;

    const cardToDuplicate = activeCase.cards.find((card) => card.id === id);
    if (!cardToDuplicate) return;

    const newCard: EvidenceCard = {
      ...cardToDuplicate,
      id: uuidv4(),
      position: {
        x: cardToDuplicate.position.x + 40,
        y: cardToDuplicate.position.y + 40,
      },
      createdAt: Date.now(),
    };

    const entry = makeHistoryEntry('card_duplicated', `Дублирована карточка: ${newCard.title || getDefaultTitle(newCard.type)}`);
    set((state) => ({
      cases: state.cases.map((c) =>
        c.id === state.activeCaseId
          ? { ...c, cards: [...c.cards, newCard], history: [...(c.history ?? []), entry], updatedAt: Date.now() }
          : c
      ),
    }));
    get().saveToStorage();
  },

  updateCardPosition: (id, position) => {
    set((state) => ({
      cases: state.cases.map((c) =>
        c.id === state.activeCaseId
          ? {
              ...c,
              cards: c.cards.map((card) =>
                card.id === id ? { ...card, position } : card
              ),
            }
          : c
      ),
    }));
    get().saveToStorage();
  },

  selectCard: (id) => set({ selectedCardId: id }),

  addLink: (source, target) => {
    const activeCase = get().cases.find((c) => c.id === get().activeCaseId);
    if (!activeCase) return;

    if (source === target) return;
    
    const exists = activeCase.links.some(
      (l) => (l.source === source && l.target === target) || (l.source === target && l.target === source)
    );
    if (exists) return;

    const newLink: EvidenceLink = {
      id: uuidv4(),
      source,
      target,
    };
    const srcTitle = activeCase.cards.find((c) => c.id === source)?.title || source;
    const tgtTitle = activeCase.cards.find((c) => c.id === target)?.title || target;
    const entry = makeHistoryEntry('link_added', `Связь: ${srcTitle} → ${tgtTitle}`);
    set((state) => ({
      cases: state.cases.map((c) =>
        c.id === state.activeCaseId
          ? { ...c, links: [...c.links, newLink], history: [...(c.history ?? []), entry], updatedAt: Date.now() }
          : c
      ),
    }));
    get().saveToStorage();
  },

  deleteLink: (id) => {
    const activeCase = get().cases.find((c) => c.id === get().activeCaseId);
    const link = activeCase?.links.find((l) => l.id === id);
    const srcTitle = activeCase?.cards.find((c) => c.id === link?.source)?.title || link?.source || id;
    const tgtTitle = activeCase?.cards.find((c) => c.id === link?.target)?.title || link?.target || '';
    const entry = makeHistoryEntry('link_deleted', `Связь удалена: ${srcTitle} → ${tgtTitle}`);
    set((state) => ({
      cases: state.cases.map((c) =>
        c.id === state.activeCaseId
          ? { ...c, links: c.links.filter((link) => link.id !== id), history: [...(c.history ?? []), entry], updatedAt: Date.now() }
          : c
      ),
    }));
    get().saveToStorage();
  },

  addTask: (text) => {
    const newTask: Task = {
      id: uuidv4(),
      text,
      completed: false,
    };
    const entry = makeHistoryEntry('task_added', `Задача добавлена: ${text}`);
    set((state) => ({
      cases: state.cases.map((c) =>
        c.id === state.activeCaseId
          ? { ...c, tasks: [...c.tasks, newTask], history: [...(c.history ?? []), entry], updatedAt: Date.now() }
          : c
      ),
    }));
    get().saveToStorage();
  },

  toggleTask: (id) => {
    const activeCase = get().cases.find((c) => c.id === get().activeCaseId);
    const task = activeCase?.tasks.find((t) => t.id === id);
    const willComplete = task ? !task.completed : false;
    const entry = makeHistoryEntry(
      'task_completed',
      willComplete ? `Задача выполнена: ${task?.text}` : `Задача возобновлена: ${task?.text}`
    );
    set((state) => ({
      cases: state.cases.map((c) =>
        c.id === state.activeCaseId
          ? {
              ...c,
              tasks: c.tasks.map((task) =>
                task.id === id ? { ...task, completed: !task.completed } : task
              ),
              history: [...(c.history ?? []), entry],
              updatedAt: Date.now(),
            }
          : c
      ),
    }));
    get().saveToStorage();
  },

  deleteTask: (id) => {
    const activeCase = get().cases.find((c) => c.id === get().activeCaseId);
    const task = activeCase?.tasks.find((t) => t.id === id);
    const entry = makeHistoryEntry('task_deleted', `Задача удалена: ${task?.text || id}`);
    set((state) => ({
      cases: state.cases.map((c) =>
        c.id === state.activeCaseId
          ? { ...c, tasks: c.tasks.filter((task) => task.id !== id), history: [...(c.history ?? []), entry], updatedAt: Date.now() }
          : c
      ),
    }));
    get().saveToStorage();
  },

  openContextMenu: (x, y, flowPosition) => {
    set({ contextMenu: { isOpen: true, x, y, flowPosition } });
  },

  closeContextMenu: () => {
    set({ contextMenu: { isOpen: false, x: 0, y: 0 } });
  },

  setImportExportOpen: (isOpen) => set({ isImportExportOpen: isOpen }),

  exportCase: () => {
    const activeCase = get().cases.find((c) => c.id === get().activeCaseId);
    if (!activeCase) return null;
    return JSON.stringify(activeCase, null, 2);
  },

  importCase: (json) => {
    try {
      const imported = JSON.parse(json) as Case;
      if (!imported.id || !imported.cards || !imported.links) {
        return false;
      }
      imported.id = `IA-${String(get().cases.length + 1).padStart(4, '0')}`;
      imported.updatedAt = Date.now();
      imported.history = [
        ...(imported.history ?? []),
        makeHistoryEntry('case_created', `Дело импортировано: ${imported.name}`),
      ];
      set((state) => ({
        cases: [...state.cases, imported],
        activeCaseId: imported.id,
      }));
      get().saveToStorage();
      return true;
    } catch {
      return false;
    }
  },

  setZoom: (zoom) => set({ zoom }),

  saveToStorage: async () => {
    try {
      await localforage.setItem('cases', get().cases);
    } catch (e) {
      console.error('Failed to save to storage:', e);
    }
  },
}));

